'use strict';

// $ node app_worker.js options
const options = JSON.parse(process.argv[2]);
if (options.require) {
  // inject
  options.require.forEach(mod => {
    require(mod);
  });
}

const fs = require('fs');
const debug = require('debug')('egg-cluster');
const gracefulExit = require('graceful-process');
const ConsoleLogger = require('egg-logger').EggConsoleLogger;
const consoleLogger = new ConsoleLogger({
  level: process.env.EGG_APP_WORKER_LOGGER_LEVEL,
});
const Application = require(options.framework).Application;
debug('new Application with options %j', options);
const app = new Application(options);
const clusterConfig = app.config.cluster || /* istanbul ignore next */ {};
const listenConfig = clusterConfig.listen || /* istanbul ignore next */ {};
const httpsOptions = Object.assign({}, clusterConfig.https, options.https);
const port = options.port = options.port || listenConfig.port;
const protocol = (httpsOptions.key && httpsOptions.cert) ? 'https' : 'http';

process.send({
  to: 'master',
  action: 'realport',
  data: {
    port,
    protocol,
  },
});

app.ready(startServer);

function exitProcess() {
  // Use SIGTERM kill process, ensure trigger the gracefulExit
  process.exitCode = 1;
  process.kill(process.pid);
}

// exit if worker start timeout
app.once('startTimeout', startTimeoutHandler);

function startTimeoutHandler() {
  consoleLogger.error('[app_worker] start timeout, exiting with code:1');
  exitProcess();
}

function startServer(err) {
  if (err) {
    consoleLogger.error(err);
    consoleLogger.error('[app_worker] start error, exiting with code:1');
    exitProcess();
    return;
  }

  app.removeListener('startTimeout', startTimeoutHandler);

  let server;

  // https config
  if (httpsOptions.key && httpsOptions.cert) {
    httpsOptions.key = fs.readFileSync(httpsOptions.key);
    httpsOptions.cert = fs.readFileSync(httpsOptions.cert);
    httpsOptions.ca = httpsOptions.ca && fs.readFileSync(httpsOptions.ca);
    server = require('https').createServer(httpsOptions, app.callback());
  } else {
    server = require('http').createServer(app.callback());
  }

  server.once('error', err => {
    consoleLogger.error('[app_worker] server got error: %s, code: %s', err.message, err.code);
    exitProcess();
  });

  // emit `server` event in app
  app.emit('server', server);

  if (options.sticky) {
    server.listen(options.stickyWorkerPort, '127.0.0.1');
    // Listen to messages sent from the master. Ignore everything else.
    process.on('message', (message, connection) => {
      if (message !== 'sticky-session:connection') {
        return;
      }

      // Emulate a connection event on the server by emitting the
      // event with the connection the master sent us.
      server.emit('connection', connection);
      connection.resume();
    });
  } else {
    if (listenConfig.path) {
      server.listen(listenConfig.path);
    } else {
      if (typeof port !== 'number') {
        consoleLogger.error('[app_worker] port should be number, but got %s(%s)', port, typeof port);
        exitProcess();
        return;
      }
      const args = [ port ];
      if (listenConfig.hostname) args.push(listenConfig.hostname);
      debug('listen options %s', args);
      server.listen(...args);
    }
  }
}

gracefulExit({
  logger: consoleLogger,
  label: 'app_worker',
  beforeExit: () => app.close(),
});
