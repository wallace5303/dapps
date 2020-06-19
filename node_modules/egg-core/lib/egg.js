'use strict';

const assert = require('assert');
const fs = require('fs');
const KoaApplication = require('koa');
const EggConsoleLogger = require('egg-logger').EggConsoleLogger;
const debug = require('debug')('egg-core');
const is = require('is-type-of');
const co = require('co');
const BaseContextClass = require('./utils/base_context_class');
const utils = require('./utils');
const Router = require('@eggjs/router').EggRouter;
const Timing = require('./utils/timing');
const Lifecycle = require('./lifecycle');

const DEPRECATE = Symbol('EggCore#deprecate');
const ROUTER = Symbol('EggCore#router');
const EGG_LOADER = Symbol.for('egg#loader');
const CLOSE_PROMISE = Symbol('EggCore#closePromise');

class EggCore extends KoaApplication {

  /**
   * @class
   * @param {Object} options - options
   * @param {String} [options.baseDir=process.cwd()] - the directory of application
   * @param {String} [options.type=application|agent] - whether it's running in app worker or agent worker
   * @param {Object} [options.plugins] - custom plugins
   * @since 1.0.0
   */
  constructor(options = {}) {
    options.baseDir = options.baseDir || process.cwd();
    options.type = options.type || 'application';

    assert(typeof options.baseDir === 'string', 'options.baseDir required, and must be a string');
    assert(fs.existsSync(options.baseDir), `Directory ${options.baseDir} not exists`);
    assert(fs.statSync(options.baseDir).isDirectory(), `Directory ${options.baseDir} is not a directory`);
    assert(options.type === 'application' || options.type === 'agent', 'options.type should be application or agent');

    super();

    this.timing = new Timing();

    // cache deprecate object by file
    this[DEPRECATE] = new Map();

    /**
     * @member {Object} EggCore#options
     * @private
     * @since 1.0.0
     */
    this._options = this.options = options;
    this.deprecate.property(this, '_options', 'app._options is deprecated, use app.options instead');

    /**
     * logging for EggCore, avoid using console directly
     * @member {Logger} EggCore#console
     * @private
     * @since 1.0.0
     */
    this.console = new EggConsoleLogger();

    /**
     * @member {BaseContextClass} EggCore#BaseContextClass
     * @since 1.0.0
     */
    this.BaseContextClass = BaseContextClass;

    /**
     * Base controller to be extended by controller in `app.controller`
     * @class Controller
     * @extends BaseContextClass
     * @example
     * class UserController extends app.Controller {}
     */
    const Controller = this.BaseContextClass;

    /**
     * Retrieve base controller
     * @member {Controller} EggCore#Controller
     * @since 1.0.0
     */
    this.Controller = Controller;

    /**
     * Base service to be extended by services in `app.service`
     * @class Service
     * @extends BaseContextClass
     * @example
     * class UserService extends app.Service {}
     */
    const Service = this.BaseContextClass;

    /**
     * Retrieve base service
     * @member {Service} EggCore#Service
     * @since 1.0.0
     */
    this.Service = Service;

    this.lifecycle = new Lifecycle({
      baseDir: options.baseDir,
      app: this,
      logger: this.console,
    });
    this.lifecycle.on('error', err => this.emit('error', err));
    this.lifecycle.on('ready_timeout', id => this.emit('ready_timeout', id));
    this.lifecycle.on('ready_stat', data => this.emit('ready_stat', data));

    /**
     * The loader instance, the default class is {@link EggLoader}.
     * If you want define
     * @member {EggLoader} EggCore#loader
     * @since 1.0.0
     */
    const Loader = this[EGG_LOADER];
    assert(Loader, 'Symbol.for(\'egg#loader\') is required');
    this.loader = new Loader({
      baseDir: options.baseDir,
      app: this,
      plugins: options.plugins,
      logger: this.console,
      serverScope: options.serverScope,
      env: options.env,
    });
  }

  /**
   * override koa's app.use, support generator function
   * @param {Function} fn - middleware
   * @return {Application} app
   * @since 1.0.0
   */
  use(fn) {
    assert(is.function(fn), 'app.use() requires a function');
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(utils.middleware(fn));
    return this;
  }

  /**
   * Whether `application` or `agent`
   * @member {String}
   * @since 1.0.0
   */
  get type() {
    return this.options.type;
  }

  /**
   * The current directory of application
   * @member {String}
   * @see {@link AppInfo#baseDir}
   * @since 1.0.0
   */
  get baseDir() {
    return this.options.baseDir;
  }

  /**
   * Alias to {@link https://npmjs.com/package/depd}
   * @member {Function}
   * @since 1.0.0
   */
  get deprecate() {
    const caller = utils.getCalleeFromStack();
    if (!this[DEPRECATE].has(caller)) {
      const deprecate = require('depd')('egg');
      // dynamic set _file to caller
      deprecate._file = caller;
      this[DEPRECATE].set(caller, deprecate);
    }
    return this[DEPRECATE].get(caller);
  }

  /**
   * The name of application
   * @member {String}
   * @see {@link AppInfo#name}
   * @since 1.0.0
   */
  get name() {
    return this.loader ? this.loader.pkg.name : '';
  }

  /**
   * Retrieve enabled plugins
   * @member {Object}
   * @since 1.0.0
   */
  get plugins() {
    return this.loader ? this.loader.plugins : {};
  }

  /**
   * The configuration of application
   * @member {Config}
   * @since 1.0.0
   */
  get config() {
    return this.loader ? this.loader.config : {};
  }

  /**
   * Execute scope after loaded and before app start.
   *
   * Notice:
   * This method is now NOT recommanded and reguarded as a deprecated one,
   * For plugin development, we should use `didLoad` instead.
   * For application development, we should use `willReady` instead.
   *
   * @see https://eggjs.org/en/advanced/loader.html#beforestart
   *
   * @param  {Function|GeneratorFunction|AsyncFunction} scope function will execute before app start
   */
  beforeStart(scope) {
    this.lifecycle.registerBeforeStart(scope);
  }

  /**
   * register an callback function that will be invoked when application is ready.
   * @see https://github.com/node-modules/ready
   * @since 1.0.0
   * @param {boolean|Error|Function} [flagOrFunction] -
   * @return {Promise|null} return promise when argument is undefined
   * @example
   * const app = new Application(...);
   * app.ready(err => {
   *   if (err) throw err;
   *   console.log('done');
   * });
   */
  ready(flagOrFunction) {
    return this.lifecycle.ready(flagOrFunction);
  }

  /**
   * If a client starts asynchronously, you can register `readyCallback`,
   * then the application will wait for the callback to ready
   *
   * It will log when the callback is not invoked after 10s
   *
   * Recommend to use {@link EggCore#beforeStart}
   * @since 1.0.0
   *
   * @param {String} name - readyCallback task name
   * @param {object} opts -
   *   - {Number} [timeout=10000] - emit `ready_timeout` when it doesn't finish but reach the timeout
   *   - {Boolean} [isWeakDep=false] - whether it's a weak dependency
   * @return {Function} - a callback
   * @example
   * const done = app.readyCallback('mysql');
   * mysql.ready(done);
   */
  readyCallback(name, opts) {
    return this.lifecycle.legacyReadyCallback(name, opts);
  }

  /**
   * Register a function that will be called when app close.
   *
   * Notice:
   * This method is now NOT recommanded directly used,
   * Developers SHOULDN'T use app.beforeClose directly now,
   * but in the form of class to implement beforeClose instead.
   *
   * @see https://eggjs.org/en/advanced/loader.html#beforeclose
   *
   * @param {Function} fn - the function that can be generator function or async function.
   */
  beforeClose(fn) {
    this.lifecycle.registerBeforeClose(fn);
  }

  /**
   * Close all, it will close
   * - callbacks registered by beforeClose
   * - emit `close` event
   * - remove add listeners
   *
   * If error is thrown when it's closing, the promise will reject.
   * It will also reject after following call.
   * @return {Promise} promise
   * @since 1.0.0
   */
  async close() {
    if (this[CLOSE_PROMISE]) return this[CLOSE_PROMISE];
    this[CLOSE_PROMISE] = this.lifecycle.close();
    return this[CLOSE_PROMISE];
  }

  /**
   * get router
   * @member {Router} EggCore#router
   * @since 1.0.0
   */
  get router() {
    if (this[ROUTER]) {
      return this[ROUTER];
    }
    const router = this[ROUTER] = new Router({ sensitive: true }, this);
    // register router middleware
    this.beforeStart(() => {
      this.use(router.middleware());
    });
    return router;
  }

  /**
   * Alias to {@link Router#url}
   * @param {String} name - Router name
   * @param {Object} params - more parameters
   * @return {String} url
   */
  url(name, params) {
    return this.router.url(name, params);
  }

  del(...args) {
    this.router.delete(...args);
    return this;
  }

  get [EGG_LOADER]() {
    return require('./loader/egg_loader');
  }

  /**
   * Convert a generator function to a promisable one.
   *
   * Notice: for other kinds of functions, it directly returns you what it is.
   *
   * @param  {Function} fn The inputted function.
   * @return {AsyncFunction} An async promise-based function.
   * @example
    ```javascript
     const fn = function* (arg) {
        return arg;
      };
      const wrapped = app.toAsyncFunction(fn);
      wrapped(true).then((value) => console.log(value));
    ```
   */
  toAsyncFunction(fn) {
    if (!is.generatorFunction(fn)) return fn;
    fn = co.wrap(fn);
    return async function(...args) {
      return fn.apply(this, args);
    };
  }

  /**
   * Convert an object with generator functions to a Promisable one.
   * @param  {Mixed} obj The inputted object.
   * @return {Promise} A Promisable result.
   * @example
    ```javascript
     const fn = function* (arg) {
        return arg;
      };
      const arr = [ fn(1), fn(2) ];
      const promise = app.toPromise(arr);
      promise.then(res => console.log(res));
    ```
   */
  toPromise(obj) {
    return co(function* () {
      return yield obj;
    });
  }
}

// delegate all router method to application
utils.methods.concat([ 'all', 'resources', 'register', 'redirect' ]).forEach(method => {
  EggCore.prototype[method] = function(...args) {
    this.router[method](...args);
    return this;
  };
});

module.exports = EggCore;
