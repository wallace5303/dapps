'use strict';

const debug = require('debug')('egg-mock:application');
const mm = require('mm');
const http = require('http');
const fs = require('fs');
const merge = require('merge-descriptors');
const is = require('is-type-of');
const assert = require('assert');
const Transport = require('egg-logger').Transport;
const mockHttpclient = require('../../lib/mock_httpclient');
const supertestRequest = require('../../lib/supertest');

const ORIGIN_TYPES = Symbol('egg-mock:originTypes');
const BACKGROUND_TASKS = Symbol('Application#backgroundTasks');

module.exports = {
  /**
   * mock Context
   * @function App#mockContext
   * @param {Object} data - ctx data
   * @return {Context} ctx
   * @example
   * ```js
   * const ctx = app.mockContext({
   *   user: {
   *     name: 'Jason'
   *   }
   * });
   * console.log(ctx.user.name); // Jason
   *
   * // controller
   * module.exports = function*() {
   *   this.body = this.user.name;
   * };
   * ```
   */
  mockContext(data) {
    data = data || {};

    if (this._customMockContext) {
      this._customMockContext(data);
    }

    // 使用者自定义mock，可以覆盖上面的 mock
    for (const key in data) {
      mm(this.context, key, data[key]);
    }

    const req = this.mockRequest(data);
    const res = new http.ServerResponse(req);

    return this.createContext(req, res);
  },

  /**
   * mock cookie session
   * @function App#mockSession
   * @param {Object} data - session object
   * @return {App} this
   */
  mockSession(data) {
    if (!data) {
      return this;
    }

    if (is.object(data) && !data.save) {
      Object.defineProperty(data, 'save', {
        value: () => {},
        enumerable: false,
      });
    }
    mm(this.context, 'session', data);
    return this;
  },

  /**
   * Mock service
   * @function App#mockService
   * @param {String} service - name
   * @param {String} methodName - method
   * @param {Object/Function/Error} fn - mock you data
   * @return {App} this
   */
  mockService(service, methodName, fn) {
    if (typeof service === 'string') {
      const arr = service.split('.');
      service = this.serviceClasses;
      for (const key of arr) {
        service = service[key];
      }
      service = service.prototype || service;
    }
    this._mockFn(service, methodName, fn);
    return this;
  },

  /**
   * mock service that return error
   * @function App#mockServiceError
   * @param {String} service - name
   * @param {String} methodName - method
   * @param {Error} [err] - error infomation
   * @return {App} this
   */
  mockServiceError(service, methodName, err) {
    if (typeof err === 'string') {
      err = new Error(err);
    } else if (!err) {
      // mockServiceError(service, methodName)
      err = new Error('mock ' + methodName + ' error');
    }
    this.mockService(service, methodName, err);
    return this;
  },

  _mockFn(obj, name, data) {
    const origin = obj[name];
    assert(is.function(origin), `property ${name} in original object must be function`);

    // keep origin properties' type to support mock multitimes
    if (!obj[ORIGIN_TYPES]) obj[ORIGIN_TYPES] = {};
    let type = obj[ORIGIN_TYPES][name];
    if (!type) {
      type = obj[ORIGIN_TYPES][name] = is.generatorFunction(origin) || is.asyncFunction(origin) ? 'async' : 'sync';
    }

    if (is.function(data)) {
      const fn = data;
      // if original is generator function or async function
      // but the mock function is normal function, need to change it return a promise
      if (type === 'async' &&
      (!is.generatorFunction(fn) && !is.asyncFunction(fn))) {
        mm(obj, name, function(...args) {
          return new Promise(resolve => {
            resolve(fn.apply(this, args));
          });
        });
        return;
      }

      mm(obj, name, fn);
      return;
    }

    if (type === 'async') {
      mm(obj, name, () => {
        return new Promise((resolve, reject) => {
          if (data instanceof Error) return reject(data);
          resolve(data);
        });
      });
      return;
    }

    mm(obj, name, () => {
      if (data instanceof Error) {
        throw data;
      }
      return data;
    });
  },

  /**
   * mock request
   * @function App#mockRequest
   * @param {Request} req - mock request
   * @return {Request} req
   */
  mockRequest(req) {
    req = Object.assign({}, req);
    const headers = req.headers || {};
    for (const key in req.headers) {
      headers[key.toLowerCase()] = req.headers[key];
    }
    if (!headers['x-forwarded-for']) {
      headers['x-forwarded-for'] = '127.0.0.1';
    }
    req.headers = headers;
    merge(req, {
      query: {},
      querystring: '',
      host: '127.0.0.1',
      hostname: '127.0.0.1',
      protocol: 'http',
      secure: 'false',
      method: 'GET',
      url: '/',
      path: '/',
      socket: {
        remoteAddress: '127.0.0.1',
        remotePort: 7001,
      },
    });
    return req;
  },

  /**
   * mock cookies
   * @function App#mockCookies
   * @param {Object} cookies - cookie
   * @return {Context} this
   */
  mockCookies(cookies) {
    if (!cookies) {
      return this;
    }
    const createContext = this.createContext;
    mm(this, 'createContext', function(req, res) {
      const ctx = createContext.call(this, req, res);
      const getCookie = ctx.cookies.get;
      mm(ctx.cookies, 'get', function(key, opts) {
        if (cookies[key]) {
          return cookies[key];
        }
        return getCookie.call(this, key, opts);
      });
      return ctx;
    });
    return this;
  },

  /**
   * mock header
   * @function App#mockHeaders
   * @param {Object} headers - header 对象
   * @return {Context} this
   */
  mockHeaders(headers) {
    if (!headers) {
      return this;
    }
    const getHeader = this.request.get;
    mm(this.request, 'get', function(field) {
      const header = findHeaders(headers, field);
      if (header) return header;
      return getHeader.call(this, field);
    });
    return this;
  },

  /**
   * mock csrf
   * @function App#mockCsrf
   * @return {App} this
   * @since 1.11
   */
  mockCsrf() {
    mm(this.context, 'assertCSRF', () => {});
    mm(this.context, 'assertCsrf', () => {});
    return this;
  },

  /**
   * mock httpclient
   * @function App#mockHttpclient
   * @param {...any} args - args
   * @return {Context} this
   */
  mockHttpclient(...args) {
    if (!this._mockHttpclient) {
      this._mockHttpclient = mockHttpclient(this);
    }
    return this._mockHttpclient(...args);
  },

  mockUrllib(...args) {
    this.deprecate('[egg-mock] Please use app.mockHttpclient instead of app.mockUrllib');
    return this.mockHttpclient(...args);
  },

  /**
   * @see mm#restore
   * @function App#mockRestore
   */
  mockRestore: mm.restore,

  /**
   * @see mm
   * @function App#mm
   */
  mm,

  /**
   * override loadAgent
   * @function App#loadAgent
   */
  loadAgent() {},

  /**
   * mock serverEnv
   * @function App#mockEnv
   * @param  {String} env - serverEnv
   * @return {App} this
   */
  mockEnv(env) {
    mm(this.config, 'env', env);
    mm(this.config, 'serverEnv', env);
    return this;
  },

  /**
   * http request helper
   * @function App#httpRequest
   * @return {SupertestRequest} req - supertest request
   * @see https://github.com/visionmedia/supertest
   */
  httpRequest() {
    return supertestRequest(this);
  },

  /**
   * collection logger message, then can be use on `expectLog()`
   * @param {String|Logger} [logger] - logger instance, default is `ctx.logger`
   * @function App#mockLog
   */
  mockLog(logger) {
    logger = logger || this.logger;
    if (typeof logger === 'string') {
      logger = this.getLogger(logger);
    }
    // make sure mock once
    if (logger._mockLogs) return;

    const transport = new Transport(logger.options);
    // https://github.com/eggjs/egg-logger/blob/master/lib/logger.js#L64
    const log = logger.log;
    mm(logger, '_mockLogs', []);
    mm(logger, 'log', (level, args, meta) => {
      const message = transport.log(level, args, meta);
      logger._mockLogs.push(message);
      log.apply(logger, [ level, args, meta ]);
    });
  },

  __checkExpectLog(expectOrNot, str, logger) {
    logger = logger || this.logger;
    if (typeof logger === 'string') {
      logger = this.getLogger(logger);
    }
    const filepath = logger.options.file;
    let content;
    if (logger._mockLogs) {
      content = logger._mockLogs.join('\n');
    } else {
      content = fs.readFileSync(filepath, 'utf8');
    }
    let match;
    let type;
    if (str instanceof RegExp) {
      match = str.test(content);
      type = 'RegExp';
    } else {
      match = content.includes(String(str));
      type = 'String';
    }
    if (expectOrNot) {
      assert(match, `Can't find ${type}:"${str}" in ${filepath}, log content: ...${content.substring(content.length - 500)}`);
    } else {
      assert(!match, `Find ${type}:"${str}" in ${filepath}, log content: ...${content.substring(content.length - 500)}`);
    }
  },

  /**
   * expect str/regexp in the logger, if your server disk is slow, please call `mockLog()` first.
   * @param {String|RegExp} str - test str or regexp
   * @param {String|Logger} [logger] - logger instance, default is `ctx.logger`
   * @function App#expectLog
   */
  expectLog(str, logger) {
    this.__checkExpectLog(true, str, logger);
  },

  /**
   * not expect str/regexp in the logger, if your server disk is slow, please call `mockLog()` first.
   * @param {String|RegExp} str - test str or regexp
   * @param {String|Logger} [logger] - logger instance, default is `ctx.logger`
   * @function App#notExpectLog
   */
  notExpectLog(str, logger) {
    this.__checkExpectLog(false, str, logger);
  },

  // private method
  backgroundTasksFinished() {
    const tasks = this._backgroundTasks;
    debug('waiting %d background tasks', tasks.length);
    if (tasks.length === 0) return Promise.resolve();

    this._backgroundTasks = [];
    return Promise.all(tasks).then(() => {
      debug('finished %d background tasks', tasks.length);
      if (this._backgroundTasks.length) {
        debug('new background tasks created: %s', this._backgroundTasks.length);
        return this.backgroundTasksFinished();
      }
    });
  },

  get _backgroundTasks() {
    if (!this[BACKGROUND_TASKS]) {
      this[BACKGROUND_TASKS] = [];
    }
    return this[BACKGROUND_TASKS];
  },

  set _backgroundTasks(tasks) {
    this[BACKGROUND_TASKS] = tasks;
  },

};

function findHeaders(headers, key) {
  if (!headers || !key) {
    return null;
  }
  key = key.toLowerCase();
  for (const headerKey in headers) {
    if (key === headerKey.toLowerCase()) {
      return headers[headerKey];
    }
  }
  return null;
}
