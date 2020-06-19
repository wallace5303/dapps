'use strict';

const os = require('os');
const util = require('util');
const path = require('path');
const fs = require('fs');
const cluster = require('cluster');
const EventEmitter = require('events');
const childprocess = require('child_process');
const cfork = require('cfork');
const ready = require('get-ready');
const GetFreePort = require('detect-port');
const ConsoleLogger = require('egg-logger').EggConsoleLogger;
const utility = require('utility');
const semver = require('semver');
const co = require('co');
const { mkdirp } = require('mz-modules');

const Manager = require('./utils/manager');
const parseOptions = require('./utils/options');
const Messenger = require('./utils/messenger');
const terminate = require('./utils/terminate');

const PROTOCOL = Symbol('Master#protocol');
const REAL_PORT = Symbol('Master#real_port');
const APP_ADDRESS = Symbol('Master#appAddress');

class Master extends EventEmitter {

  /**
   * @class
   * @param {Object} options
   *  - {String} [framework] - specify framework that can be absolute path or npm package
   *  - {String} [baseDir] directory of application, default to `process.cwd()`
   *  - {Object} [plugins] - customized plugins, for unittest
   *  - {Number} [workers] numbers of app workers, default to `os.cpus().length`
   *  - {Number} [port] listening port, default to 7001(http) or 8443(https)
   *  - {Object} [https] https options, { key, cert, ca }, full path
   *  - {Array|String} [require] will inject into worker/agent process
   *  - {String} [pidFile] will save master pid to this file
   */
  constructor(options) {
    super();
    this.options = parseOptions(options);
    this.workerManager = new Manager();
    this.messenger = new Messenger(this);

    ready.mixin(this);

    this.isProduction = isProduction();
    this.agentWorkerIndex = 0;
    this.closed = false;
    this[REAL_PORT] = this.options.port;
    this[PROTOCOL] = this.options.https ? 'https' : 'http';

    // app started or not
    this.isStarted = false;
    this.logger = new ConsoleLogger({ level: process.env.EGG_MASTER_LOGGER_LEVEL || 'INFO' });
    this.logMethod = 'info';
    if (process.env.EGG_SERVER_ENV === 'local' || process.env.NODE_ENV === 'development') {
      this.logMethod = 'debug';
    }

    // get the real framework info
    const frameworkPath = this.options.framework;
    const frameworkPkg = utility.readJSONSync(path.join(frameworkPath, 'package.json'));

    this.log(`[master] =================== ${frameworkPkg.name} start =====================`);
    this.logger.info(`[master] node version ${process.version}`);
    /* istanbul ignore next */
    if (process.alinode) this.logger.info(`[master] alinode version ${process.alinode}`);
    this.logger.info(`[master] ${frameworkPkg.name} version ${frameworkPkg.version}`);

    if (this.isProduction) {
      this.logger.info('[master] start with options:%s%s',
        os.EOL, JSON.stringify(this.options, null, 2));
    } else {
      this.log('[master] start with options: %j', this.options);
    }
    this.log('[master] start with env: isProduction: %s, EGG_SERVER_ENV: %s, NODE_ENV: %s',
      this.isProduction, process.env.EGG_SERVER_ENV, process.env.NODE_ENV);

    const startTime = Date.now();

    this.ready(() => {
      this.isStarted = true;
      const stickyMsg = this.options.sticky ? ' with STICKY MODE!' : '';
      this.logger.info('[master] %s started on %s (%sms)%s',
        frameworkPkg.name, this[APP_ADDRESS], Date.now() - startTime, stickyMsg);

      const action = 'egg-ready';
      this.messenger.send({
        action,
        to: 'parent',
        data: {
          port: this[REAL_PORT],
          address: this[APP_ADDRESS],
          protocol: this[PROTOCOL],
        },
      });
      this.messenger.send({
        action,
        to: 'app',
        data: this.options,
      });
      this.messenger.send({
        action,
        to: 'agent',
        data: this.options,
      });

      // start check agent and worker status
      if (this.isProduction) {
        this.workerManager.startCheck();
      }
    });

    this.on('agent-exit', this.onAgentExit.bind(this));
    this.on('agent-start', this.onAgentStart.bind(this));
    this.on('app-exit', this.onAppExit.bind(this));
    this.on('app-start', this.onAppStart.bind(this));
    this.on('reload-worker', this.onReload.bind(this));


    // fork app workers after agent started
    this.once('agent-start', this.forkAppWorkers.bind(this));
    // get the real port from options and app.config
    // app worker will send after loading
    this.on('realport', ({ port, protocol }) => {
      if (port) this[REAL_PORT] = port;
      if (protocol) this[PROTOCOL] = protocol;
    });

    // https://nodejs.org/api/process.html#process_signal_events
    // https://en.wikipedia.org/wiki/Unix_signal
    // kill(2) Ctrl-C
    process.once('SIGINT', this.onSignal.bind(this, 'SIGINT'));
    // kill(3) Ctrl-\
    process.once('SIGQUIT', this.onSignal.bind(this, 'SIGQUIT'));
    // kill(15) default
    process.once('SIGTERM', this.onSignal.bind(this, 'SIGTERM'));

    process.once('exit', this.onExit.bind(this));

    // write pid to file if provided
    if (this.options.pidFile) {
      mkdirp.sync(path.dirname(this.options.pidFile));
      fs.writeFileSync(this.options.pidFile, process.pid, 'utf-8');
    }

    this.detectPorts()
      .then(() => {
        this.forkAgentWorker();
      });

    // exit when agent or worker exception
    this.workerManager.on('exception', ({
      agent,
      worker,
    }) => {
      const err = new Error(`[master] ${agent} agent and ${worker} worker(s) alive, exit to avoid unknown state`);
      err.name = 'ClusterWorkerExceptionError';
      err.count = {
        agent,
        worker,
      };
      this.logger.error(err);
      process.exit(1);
    });
  }

  detectPorts() {
    // Detect cluster client port
    return GetFreePort()
      .then(port => {
        this.options.clusterPort = port;
        // If sticky mode, detect worker port
        if (this.options.sticky) {
          return GetFreePort();
        }
      })
      .then(port => {
        if (this.options.sticky) {
          this.options.stickyWorkerPort = port;
        }
      })
      .catch(/* istanbul ignore next */ err => {
        this.logger.error(err);
        process.exit(1);
      });
  }


  log(...args) {
    this.logger[this.logMethod](...args);
  }

  get agentWorker() {
    return this.workerManager.agent;
  }

  startMasterSocketServer(cb) {
    // Create the outside facing server listening on our port.
    require('net').createServer({
      pauseOnConnect: true,
    }, connection => {
      // We received a connection and need to pass it to the appropriate
      // worker. Get the worker for this connection's source IP and pass
      // it the connection.

      /* istanbul ignore next */
      if (!connection.remoteAddress) {
        // This will happen when a client sends an RST(which is set to 1) right
        // after the three-way handshake to the server.
        // Read https://en.wikipedia.org/wiki/TCP_reset_attack for more details.
        connection.destroy();
      } else {
        const worker = this.stickyWorker(connection.remoteAddress);
        worker.send('sticky-session:connection', connection);
      }
    }).listen(this[REAL_PORT], cb);
  }

  stickyWorker(ip) {
    const workerNumbers = this.options.workers;
    const ws = this.workerManager.listWorkerIds();

    let s = '';
    for (let i = 0; i < ip.length; i++) {
      if (!isNaN(ip[i])) {
        s += ip[i];
      }
    }
    s = Number(s);
    const pid = ws[s % workerNumbers];
    return this.workerManager.getWorker(pid);
  }

  forkAgentWorker() {
    this.agentStartTime = Date.now();

    const args = [ JSON.stringify(this.options) ];
    const opt = {};

    if (process.platform === 'win32') opt.windowsHide = true;

    // add debug execArgv
    const debugPort = process.env.EGG_AGENT_DEBUG_PORT || 5800;
    if (this.options.isDebug) opt.execArgv = process.execArgv.concat([ `--${semver.gte(process.version, '8.0.0') ? 'inspect' : 'debug'}-port=${debugPort}` ]);

    const agentWorker = childprocess.fork(this.getAgentWorkerFile(), args, opt);
    agentWorker.status = 'starting';
    agentWorker.id = ++this.agentWorkerIndex;
    this.workerManager.setAgent(agentWorker);
    this.log('[master] agent_worker#%s:%s start with clusterPort:%s',
      agentWorker.id, agentWorker.pid, this.options.clusterPort);

    // send debug message
    if (this.options.isDebug) {
      this.messenger.send({
        to: 'parent',
        from: 'agent',
        action: 'debug',
        data: {
          debugPort,
          pid: agentWorker.pid,
        },
      });
    }
    // forwarding agent' message to messenger
    agentWorker.on('message', msg => {
      if (typeof msg === 'string') {
        msg = {
          action: msg,
          data: msg,
        };
      }
      msg.from = 'agent';
      this.messenger.send(msg);
    });
    agentWorker.on('error', err => {
      err.name = 'AgentWorkerError';
      err.id = agentWorker.id;
      err.pid = agentWorker.pid;
      this.logger.error(err);
    });
    // agent exit message
    agentWorker.once('exit', (code, signal) => {
      this.messenger.send({
        action: 'agent-exit',
        data: {
          code,
          signal,
        },
        to: 'master',
        from: 'agent',
      });
    });
  }

  forkAppWorkers() {
    this.appStartTime = Date.now();
    this.isAllAppWorkerStarted = false;
    this.startSuccessCount = 0;
    const args = [ JSON.stringify(this.options) ];
    this.log('[master] start appWorker with args %j', args);
    cfork({
      exec: this.getAppWorkerFile(),
      args,
      silent: false,
      count: this.options.workers,
      // don't refork in local env
      refork: this.isProduction,
      windowsHide: process.platform === 'win32',
    });

    let debugPort = process.debugPort;
    cluster.on('fork', worker => {
      worker.disableRefork = true;
      this.workerManager.setWorker(worker);
      worker.on('message', msg => {
        if (typeof msg === 'string') {
          msg = {
            action: msg,
            data: msg,
          };
        }
        msg.from = 'app';
        this.messenger.send(msg);
      });
      this.log('[master] app_worker#%s:%s start, state: %s, current workers: %j',
        worker.id, worker.process.pid, worker.state, Object.keys(cluster.workers));

      // send debug message, due to `brk` scence, send here instead of app_worker.js
      if (this.options.isDebug) {
        debugPort++;
        this.messenger.send({
          to: 'parent',
          from: 'app',
          action: 'debug',
          data: {
            debugPort,
            pid: worker.process.pid,
          },
        });
      }
    });
    cluster.on('disconnect', worker => {
      this.logger.info('[master] app_worker#%s:%s disconnect, suicide: %s, state: %s, current workers: %j',
        worker.id, worker.process.pid, worker.exitedAfterDisconnect, worker.state, Object.keys(cluster.workers));
    });
    cluster.on('exit', (worker, code, signal) => {
      this.messenger.send({
        action: 'app-exit',
        data: {
          workerPid: worker.process.pid,
          code,
          signal,
        },
        to: 'master',
        from: 'app',
      });
    });
    cluster.on('listening', (worker, address) => {
      this.messenger.send({
        action: 'app-start',
        data: {
          workerPid: worker.process.pid,
          address,
        },
        to: 'master',
        from: 'app',
      });
    });
  }

  /**
   * close agent worker, App Worker will closed by cluster
   *
   * https://www.exratione.com/2013/05/die-child-process-die/
   * make sure Agent Worker exit before master exit
   *
   * @param {number} timeout - kill agent timeout
   * @return {Promise} -
   */
  killAgentWorker(timeout) {
    const agentWorker = this.agentWorker;
    if (agentWorker) {
      this.log('[master] kill agent worker with signal SIGTERM');
      agentWorker.removeAllListeners();
    }
    return co(function* () {
      yield terminate(agentWorker, timeout);
    });
  }

  killAppWorkers(timeout) {
    return co(function* () {
      yield Object.keys(cluster.workers).map(id => {
        const worker = cluster.workers[id];
        worker.disableRefork = true;
        return terminate(worker, timeout);
      });
    });
  }

  /**
   * Agent Worker exit handler
   * Will exit during startup, and refork during running.
   * @param {Object} data
   *  - {Number} code - exit code
   *  - {String} signal - received signal
   */
  onAgentExit(data) {
    if (this.closed) return;

    this.messenger.send({
      action: 'egg-pids',
      to: 'app',
      data: [],
    });
    const agentWorker = this.agentWorker;
    this.workerManager.deleteAgent(this.agentWorker);

    const err = new Error(util.format('[master] agent_worker#%s:%s died (code: %s, signal: %s)',
      agentWorker.id, agentWorker.pid, data.code, data.signal));
    err.name = 'AgentWorkerDiedError';
    this.logger.error(err);

    // remove all listeners to avoid memory leak
    agentWorker.removeAllListeners();

    if (this.isStarted) {
      this.log('[master] try to start a new agent_worker after 1s ...');
      setTimeout(() => {
        this.logger.info('[master] new agent_worker starting...');
        this.forkAgentWorker();
      }, 1000);
      this.messenger.send({
        action: 'agent-worker-died',
        to: 'parent',
      });
    } else {
      this.logger.error('[master] agent_worker#%s:%s start fail, exiting with code:1',
        agentWorker.id, agentWorker.pid);
      process.exit(1);
    }
  }

  onAgentStart() {
    this.agentWorker.status = 'started';

    // Send egg-ready when agent is started after launched
    if (this.isAllAppWorkerStarted) {
      this.messenger.send({
        action: 'egg-ready',
        to: 'agent',
        data: this.options,
      });
    }

    this.messenger.send({
      action: 'egg-pids',
      to: 'app',
      data: [ this.agentWorker.pid ],
    });
    // should send current worker pids when agent restart
    if (this.isStarted) {
      this.messenger.send({
        action: 'egg-pids',
        to: 'agent',
        data: this.workerManager.getListeningWorkerIds(),
      });
    }

    this.messenger.send({
      action: 'agent-start',
      to: 'app',
    });
    this.logger.info('[master] agent_worker#%s:%s started (%sms)',
      this.agentWorker.id, this.agentWorker.pid, Date.now() - this.agentStartTime);
  }

  /**
   * App Worker exit handler
   * @param {Object} data
   *  - {String} workerPid - worker id
   *  - {Number} code - exit code
   *  - {String} signal - received signal
   */
  onAppExit(data) {
    if (this.closed) return;

    const worker = this.workerManager.getWorker(data.workerPid);

    if (!worker.isDevReload) {
      const signal = data.signal;
      const message = util.format(
        '[master] app_worker#%s:%s died (code: %s, signal: %s, suicide: %s, state: %s), current workers: %j',
        worker.id, worker.process.pid, worker.process.exitCode, signal,
        worker.exitedAfterDisconnect, worker.state,
        Object.keys(cluster.workers)
      );
      if (this.options.isDebug && signal === 'SIGKILL') {
        // exit if died during debug
        this.logger.error(message);
        this.logger.error('[master] worker kill by debugger, exiting...');
        setTimeout(() => this.close(), 10);
      } else {
        const err = new Error(message);
        err.name = 'AppWorkerDiedError';
        this.logger.error(err);
      }
    }

    // remove all listeners to avoid memory leak
    worker.removeAllListeners();
    this.workerManager.deleteWorker(data.workerPid);
    // send message to agent with alive workers
    this.messenger.send({
      action: 'egg-pids',
      to: 'agent',
      data: this.workerManager.getListeningWorkerIds(),
    });

    if (this.isAllAppWorkerStarted) {
      // cfork will only refork at production mode
      this.messenger.send({
        action: 'app-worker-died',
        to: 'parent',
      });

    } else {
      // exit if died during startup
      this.logger.error('[master] app_worker#%s:%s start fail, exiting with code:1',
        worker.id, worker.process.pid);
      process.exit(1);
    }
  }

  /**
   * after app worker
   * @param {Object} data
   *  - {String} workerPid - worker id
   *  - {Object} address - server address
   */
  onAppStart(data) {
    const worker = this.workerManager.getWorker(data.workerPid);
    const address = data.address;

    // worker should listen stickyWorkerPort when sticky mode
    if (this.options.sticky) {
      if (String(address.port) !== String(this.options.stickyWorkerPort)) {
        return;
      }
      // worker should listen REALPORT when not sticky mode
    } else if (!isUnixSock(address) &&
      (String(address.port) !== String(this[REAL_PORT]))) {
      return;
    }

    // send message to agent with alive workers
    this.messenger.send({
      action: 'egg-pids',
      to: 'agent',
      data: this.workerManager.getListeningWorkerIds(),
    });

    this.startSuccessCount++;

    const remain = this.isAllAppWorkerStarted ? 0 : this.options.workers - this.startSuccessCount;
    this.log('[master] app_worker#%s:%s started at %s, remain %s (%sms)',
      worker.id, data.workerPid, address.port, remain, Date.now() - this.appStartTime);

    // Send egg-ready when app is started after launched
    if (this.isAllAppWorkerStarted) {
      this.messenger.send({
        action: 'egg-ready',
        to: 'app',
        data: this.options,
      });
    }

    // if app is started, it should enable this worker
    if (this.isAllAppWorkerStarted) {
      worker.disableRefork = false;
    }

    if (this.isAllAppWorkerStarted || this.startSuccessCount < this.options.workers) {
      return;
    }

    this.isAllAppWorkerStarted = true;

    // enable all workers when app started
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      worker.disableRefork = false;
    }

    address.protocol = this[PROTOCOL];
    address.port = this.options.sticky ? this[REAL_PORT] : address.port;
    this[APP_ADDRESS] = getAddress(address);

    if (this.options.sticky) {
      this.startMasterSocketServer(err => {
        if (err) return this.ready(err);
        this.ready(true);
      });
    } else {
      this.ready(true);
    }
  }

  /**
   * master exit handler
   */

  onExit(code) {
    if (this.options.pidFile && fs.existsSync(this.options.pidFile)) {
      try {
        fs.unlinkSync(this.options.pidFile);
      } catch (err) {
        /* istanbul ignore next */
        this.logger.error('[master] delete pidfile %s fail with %s', this.options.pidFile, err.message);
      }
    }
    // istanbul can't cover here
    // https://github.com/gotwarlost/istanbul/issues/567
    const level = code === 0 ? 'info' : 'error';
    this.logger[level]('[master] exit with code:%s', code);
  }

  onSignal(signal) {
    if (this.closed) return;

    this.logger.info('[master] receive signal %s, closing', signal);
    this.close();
  }

  /**
   * reload workers, for develop purpose
   */
  onReload() {
    this.log('[master] reload workers...');
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      worker.isDevReload = true;
    }
    require('cluster-reload')(this.options.workers);
  }

  close() {
    this.closed = true;
    const self = this;
    co(function* () {
      try {
        yield self._doClose();
        self.log('[master] close done, exiting with code:0');
        process.exit(0);
      } catch (e) /* istanbul ignore next */ {
        this.logger.error('[master] close with error: ', e);
        process.exit(1);
      }
    });
  }

  getAgentWorkerFile() {
    return path.join(__dirname, 'agent_worker.js');
  }

  getAppWorkerFile() {
    return path.join(__dirname, 'app_worker.js');
  }

  * _doClose() {
    // kill app workers
    // kill agent worker
    // exit itself
    const legacyTimeout = process.env.EGG_MASTER_CLOSE_TIMEOUT || 5000;
    const appTimeout = process.env.EGG_APP_CLOSE_TIMEOUT || legacyTimeout;
    const agentTimeout = process.env.EGG_AGENT_CLOSE_TIMEOUT || legacyTimeout;
    this.logger.info('[master] send kill SIGTERM to app workers, will exit with code:0 after %sms', appTimeout);
    this.logger.info('[master] wait %sms', appTimeout);
    try {
      yield this.killAppWorkers(appTimeout);
    } catch (e) /* istanbul ignore next */ {
      this.logger.error('[master] app workers exit error: ', e);
    }
    this.logger.info('[master] send kill SIGTERM to agent worker, will exit with code:0 after %sms', agentTimeout);
    this.logger.info('[master] wait %sms', agentTimeout);
    try {
      yield this.killAgentWorker(agentTimeout);
    } catch (e) /* istanbul ignore next */ {
      this.logger.error('[master] agent worker exit error: ', e);
    }
  }
}

module.exports = Master;

function isProduction() {
  const serverEnv = process.env.EGG_SERVER_ENV;
  if (serverEnv) {
    return serverEnv !== 'local' && serverEnv !== 'unittest';
  }
  return process.env.NODE_ENV === 'production';
}

function getAddress({
  addressType,
  address,
  port,
  protocol,
}) {
  // unix sock
  // https://nodejs.org/api/cluster.html#cluster_event_listening_1
  if (addressType === -1) return address;

  let hostname = address;
  if (!hostname && process.env.HOST && process.env.HOST !== '0.0.0.0') {
    hostname = process.env.HOST;
  }
  if (!hostname) {
    hostname = '127.0.0.1';
  }
  return `${protocol}://${hostname}:${port}`;
}

function isUnixSock(address) {
  return address.addressType === -1;
}
