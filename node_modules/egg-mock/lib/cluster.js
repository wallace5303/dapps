'use strict';

const debug = require('debug')('egg-mock:cluster');
const path = require('path');
const childProcess = require('child_process');
const Coffee = require('coffee').Coffee;
const ready = require('get-ready');
const { rimraf } = require('mz-modules');
const sleep = require('ko-sleep');
const os = require('os');
const co = require('co');
const awaitEvent = require('await-event');
const supertestRequest = require('./supertest');

const formatOptions = require('./format_options');

const clusters = new Map();
const serverBin = path.join(__dirname, 'start-cluster');
const requestCallFunctionFile = path.join(__dirname, 'request_call_function.js');
let masterPort = 17000;

/**
 * A cluster version of egg.Application, you can test with supertest
 * @example
 * ```js
 * const mm = require('mm');
 * const request = require('supertest');
 *
 * describe('ClusterApplication', () => {
 *   let app;
 *   before(function (done) {
 *     app = mm.cluster({ baseDir });
 *     app.ready(done);
 *   });
 *
 *   after(function () {
 *     app.close();
 *   });
 *
 *   it('should 200', function (done) {
 *     request(app.callback())
 *     .get('/')
 *     .expect(200, done);
 *   });
 * });
 */
class ClusterApplication extends Coffee {
  /**
   * @class
   * @param {Object} options
   * - {String} baseDir - The directory of the application
   * - {Object} plugins - Tustom you plugins
   * - {String} framework - The directory of the egg framework
   * - {Boolean} [cache=true]  - Cache application based on baseDir
   * - {Boolean} [coverage=true]  - Swtich on process coverage, but it'll be slower
   * - {Boolean} [clean=true]  - Remove $baseDir/logs
   * - {Object}  [opt] - opt pass to coffee, such as { execArgv: ['--debug'] }
   * ```
   */
  constructor(options) {
    const opt = options.opt;
    delete options.opt;

    // incremental port
    options.port = options.port || ++masterPort;
    // Set 1 worker when test
    if (!options.workers) options.workers = 1;

    const args = [ JSON.stringify(options) ];
    debug('fork %s, args: %s, opt: %j', serverBin, args.join(' '), opt);
    super({
      method: 'fork',
      cmd: serverBin,
      args,
      opt,
    });

    ready.mixin(this);

    this.port = options.port;
    this.baseDir = options.baseDir;

    // print stdout and stderr when DEBUG, otherwise stderr.
    this.debug(process.env.DEBUG ? 0 : 2);

    // disable coverage
    if (options.coverage === false) {
      this.coverage(false);
    }

    process.nextTick(() => {
      this.proc.on('message', msg => {
        // 'egg-ready' and { action: 'egg-ready' }
        const action = msg && msg.action ? msg.action : msg;
        switch (action) {
          case 'egg-ready':
            this.emit('close', 0);
            break;
          case 'app-worker-died':
          case 'agent-worker-died':
            this.emit('close', 1);
            break;
          default:
            // ignore it
            break;
        }
      });
    });

    this.end(() => this.ready(true));
  }

  /**
   * the process that forked
   * @member {ChildProcess}
   */
  get process() {
    return this.proc;
  }

  /**
   * Compatible API for supertest
   * @return {ClusterApplication} return the instance
   */
  callback() {
    return this;
  }

  /**
   * Compatible API for supertest
   * @member {String} url
   * @private
   */
  get url() {
    return 'http://127.0.0.1:' + this.port;
  }

  /**
   * Compatible API for supertest
   * @return {Object}
   *  - {Number} port
   * @private
   */
  address() {
    return {
      port: this.port,
    };
  }

  /**
   * Compatible API for supertest
   * @return {ClusterApplication} return the instance
   * @private
   */
  listen() {
    return this;
  }

  /**
   * kill the process
   * @return {Promise} promise
   */
  close() {
    this.closed = true;

    const proc = this.proc;
    const baseDir = this.baseDir;
    return co(function* () {
      if (proc.connected) {
        proc.kill('SIGTERM');
        yield awaitEvent.call(proc, 'exit');
      }

      clusters.delete(baseDir);
      debug('delete cluster cache %s, remain %s', baseDir, [ ...clusters.keys() ]);

      /* istanbul ignore if */
      if (os.platform() === 'win32') yield sleep(1000);
    });
  }

  // mock app.router.pathFor(name) api
  get router() {
    const that = this;
    return {
      pathFor(url) {
        return that._callFunctionOnAppWorker('pathFor', [ url ], 'router', true);
      },
    };
  }

  /**
   * collection logger message, then can be use on `expectLog()`
   * it's different from `app.expectLog()`, only support string params.
   *
   * @param {String} [logger] - logger instance name, default is `logger`
   * @function ClusterApplication#expectLog
   */
  mockLog(logger) {
    logger = logger || 'logger';
    this._callFunctionOnAppWorker('mockLog', [ logger ], null, true);
  }

  /**
   * expect str in the logger
   * it's different from `app.expectLog()`, only support string params.
   *
   * @param {String} str - test str
   * @param {String} [logger] - logger instance name, default is `logger`
   * @function ClusterApplication#expectLog
   */
  expectLog(str, logger) {
    logger = logger || 'logger';
    this._callFunctionOnAppWorker('expectLog', [ str, logger ], null, true);
  }

  /**
   * not expect str in the logger
   * it's different from `app.notExpectLog()`, only support string params.
   *
   * @param {String} str - test str
   * @param {String} [logger] - logger instance name, default is `logger`
   * @function ClusterApplication#notExpectLog
   */
  notExpectLog(str, logger) {
    logger = logger || 'logger';
    this._callFunctionOnAppWorker('notExpectLog', [ str, logger ], null, true);
  }

  httpRequest() {
    return supertestRequest(this);
  }

  _callFunctionOnAppWorker(method, args = [], property = undefined, needResult = false) {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (typeof arg === 'function') {
        args[i] = {
          __egg_mock_type: 'function',
          value: arg.toString(),
        };
      } else if (arg instanceof Error) {
        const errObject = {
          __egg_mock_type: 'error',
          name: arg.name,
          message: arg.message,
          stack: arg.stack,
        };
        for (const key in arg) {
          if (key !== 'name' && key !== 'message' && key !== 'stack') {
            errObject[key] = arg[key];
          }
        }
        args[i] = errObject;
      }
    }
    const data = {
      port: this.port,
      method,
      args,
      property,
      needResult,
    };
    const child = childProcess.spawnSync(process.execPath, [
      requestCallFunctionFile,
      JSON.stringify(data),
    ], {
      stdio: 'pipe',
    });
    if (child.stderr && child.stderr.length > 0) {
      console.error(child.stderr.toString());
    }

    let result;
    if (child.stdout && child.stdout.length > 0) {
      if (needResult) {
        result = JSON.parse(child.stdout.toString());
      } else {
        console.error(child.stdout.toString());
      }
    }

    if (child.status !== 0) {
      throw new Error(child.stderr.toString());
    }
    if (child.error) {
      throw child.error;
    }

    return result;
  }
}

module.exports = options => {
  options = formatOptions(options);
  if (options.cache && clusters.has(options.baseDir)) {
    const clusterApp = clusters.get(options.baseDir);
    // return cache when it hasn't been killed
    if (!clusterApp.closed) {
      return clusterApp;
    }

    // delete the cache when it's closed
    clusters.delete(options.baseDir);
  }

  if (options.clean !== false) {
    const logDir = path.join(options.baseDir, 'logs');
    try {
      rimraf.sync(logDir);
    } catch (err) {
      /* istanbul ignore next */
      console.error(`remove log dir ${logDir} failed: ${err.stack}`);
    }
  }

  let clusterApp = new ClusterApplication(options);
  clusterApp = new Proxy(clusterApp, {
    get(target, prop) {
      debug('proxy handler.get %s', prop);
      // proxy mockXXX function to app worker
      const method = prop;
      if (typeof method === 'string' && /^mock\w+$/.test(method) && target[method] === undefined) {
        return function mockProxy(...args) {
          return target._callFunctionOnAppWorker(method, args, null, true);
        };
      }

      return target[prop];
    },
  });

  clusters.set(options.baseDir, clusterApp);
  return clusterApp;
};

// export to let mm.restore() worked
module.exports.restore = () => {
  for (const clusterApp of clusters.values()) {
    clusterApp.mockRestore();
  }
};

// ensure to close App process on test exit.
process.on('exit', () => {
  for (const clusterApp of clusters.values()) {
    clusterApp.close();
  }
});
