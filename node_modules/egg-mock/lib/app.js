'use strict';

const co = require('co');
const path = require('path');
const is = require('is-type-of');
const { rimraf } = require('mz-modules');
const sleep = require('ko-sleep');
const ready = require('get-ready');
const detectPort = require('detect-port');
const debug = require('debug')('egg-mock');
const EventEmitter = require('events');
const os = require('os');
const formatOptions = require('./format_options');
const context = require('./context');
const mockCustomLoader = require('./mock_custom_loader');
const mockHttpServer = require('./mock_http_server');

const apps = new Map();
const INIT = Symbol('init');
const APP_INIT = Symbol('appInit');
const BIND_EVENT = Symbol('bindEvent');
const INIT_ON_LISTENER = Symbol('initOnListener');
const INIT_ONCE_LISTENER = Symbol('initOnceListener');
const MESSENGER = Symbol('messenger');
const MOCK_APP_METHOD = [
  'ready',
  'closed',
  'close',
  '_agent',
  '_app',
  'on',
  'once',
];

class MockApplication extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this.baseDir = options.baseDir;
    this.closed = false;
    this[APP_INIT] = false;
    this[INIT_ON_LISTENER] = new Set();
    this[INIT_ONCE_LISTENER] = new Set();
    ready.mixin(this);
    // listen once, otherwise will throw exception when emit error without listenr
    this.once('error', () => {});

    co(this[INIT].bind(this))
      .then(() => this.ready(true))
      .catch(err => {
        if (!this[APP_INIT]) {
          this.emit('error', err);
        }
        this.ready(err);
      });
  }

  * [INIT]() {
    if (this.options.beforeInit) {
      yield this.options.beforeInit(this);
      delete this.options.beforeInit;
    }
    if (this.options.clean !== false) {
      const logDir = path.join(this.options.baseDir, 'logs');
      try {
        /* istanbul ignore if */
        if (os.platform() === 'win32') yield sleep(1000);
        yield rimraf(logDir);
      } catch (err) {
        /* istanbul ignore next */
        console.error(`remove log dir ${logDir} failed: ${err.stack}`);
      }
    }

    this.options.clusterPort = yield detectPort();
    debug('get clusterPort %s', this.options.clusterPort);
    const egg = require(this.options.framework);

    const Agent = egg.Agent;
    const agent = this._agent = new Agent(Object.assign({}, this.options));
    debug('agent instantiate');
    yield agent.ready();
    debug('agent ready');

    const Application = bindMessenger(egg.Application, agent);
    const app = this._app = new Application(Object.assign({}, this.options));

    // https://github.com/eggjs/egg/blob/8bb7c7e7d59d6aeca4b2ed1eb580368dcb731a4d/lib/egg.js#L125
    // egg single mode mount this at start(), so egg-mock should impel it.
    app.agent = agent;
    agent.app = app;

    // egg-mock plugin need to override egg context
    Object.assign(app.context, context);
    mockCustomLoader(app);

    debug('app instantiate');
    this[APP_INIT] = true;
    debug('this[APP_INIT] = true');
    this[BIND_EVENT]();
    debug('http server instantiate');
    mockHttpServer(app);
    yield app.ready();

    const msg = {
      action: 'egg-ready',
      data: this.options,
    };
    app.messenger._onMessage(msg);
    agent.messenger._onMessage(msg);
    debug('app ready');
  }

  [BIND_EVENT]() {
    for (const args of this[INIT_ON_LISTENER]) {
      debug('on(%s), use cache and pass to app', args);
      this._app.on(...args);
      this.removeListener(...args);
    }
    for (const args of this[INIT_ONCE_LISTENER]) {
      debug('once(%s), use cache and pass to app', args);
      this._app.on(...args);
      this.removeListener(...args);
    }
  }

  on(...args) {
    if (this[APP_INIT]) {
      debug('on(%s), pass to app', args);
      this._app.on(...args);
    } else {
      debug('on(%s), cache it because app has not init', args);
      this[INIT_ON_LISTENER].add(args);
      super.on(...args);
    }
  }

  once(...args) {
    if (this[APP_INIT]) {
      debug('once(%s), pass to app', args);
      this._app.once(...args);
    } else {
      debug('once(%s), cache it because app has not init', args);
      this[INIT_ONCE_LISTENER].add(args);
      super.on(...args);
    }
  }

  /**
   * close app
   * @return {Promise} promise
   */
  close() {
    this.closed = true;
    const self = this;
    const baseDir = this.baseDir;
    return co(function* () {
      if (self._app) {
        yield self._app.close();
      } else {
        // when app init throws an exception, must wait for app quit gracefully
        yield sleep(200);
      }

      if (self._agent) yield self._agent.close();

      apps.delete(baseDir);
      debug('delete app cache %s, remain %s', baseDir, [ ...apps.keys() ]);

      /* istanbul ignore if */
      if (os.platform() === 'win32') yield sleep(1000);
    });
  }
}

module.exports = function(options) {
  options = formatOptions(options);
  if (options.cache && apps.has(options.baseDir)) {
    const app = apps.get(options.baseDir);
    // return cache when it hasn't been killed
    if (!app.closed) {
      return app;
    }
    // delete the cache when it's closed
    apps.delete(options.baseDir);
  }

  let app = new MockApplication(options);
  app = new Proxy(app, {
    get(target, prop) {
      // don't delegate properties on MockApplication
      if (MOCK_APP_METHOD.includes(prop)) return getProperty(target, prop);
      if (!target[APP_INIT]) throw new Error(`can't get ${prop} before ready`);
      // it's asyncrounus when agent and app are loading,
      // so should get the properties after loader ready
      debug('proxy handler.get %s', prop);
      return target._app[prop];
    },
    set(target, prop, value) {
      if (MOCK_APP_METHOD.includes(prop)) return true;
      if (!target[APP_INIT]) throw new Error(`can't set ${prop} before ready`);
      debug('proxy handler.set %s', prop);
      target._app[prop] = value;
      return true;
    },
    defineProperty(target, prop, descriptor) {
      // can't define properties on MockApplication
      if (MOCK_APP_METHOD.includes(prop)) return true;
      if (!target[APP_INIT]) throw new Error(`can't defineProperty ${prop} before ready`);
      debug('proxy handler.defineProperty %s', prop);
      Object.defineProperty(target._app, prop, descriptor);
      return true;
    },
    deleteProperty(target, prop) {
      // can't delete properties on MockApplication
      if (MOCK_APP_METHOD.includes(prop)) return true;
      if (!target[APP_INIT]) throw new Error(`can't delete ${prop} before ready`);
      debug('proxy handler.deleteProperty %s', prop);
      delete target._app[prop];
      return true;
    },
    getOwnPropertyDescriptor(target, prop) {
      if (MOCK_APP_METHOD.includes(prop)) return Object.getOwnPropertyDescriptor(target, prop);
      if (!target[APP_INIT]) throw new Error(`can't getOwnPropertyDescriptor ${prop} before ready`);
      debug('proxy handler.getOwnPropertyDescriptor %s', prop);
      return Object.getOwnPropertyDescriptor(target._app, prop);
    },
    getPrototypeOf(target) {
      if (!target[APP_INIT]) throw new Error('can\'t getPrototypeOf before ready');
      debug('proxy handler.getPrototypeOf %s');
      return Object.getPrototypeOf(target._app);
    },
  });

  apps.set(options.baseDir, app);
  return app;
};

function getProperty(target, prop) {
  const member = target[prop];
  if (is.function(member)) {
    return member.bind(target);
  }
  return member;
}


function bindMessenger(Application, agent) {
  const agentMessenger = agent.messenger;
  return class MessengerApplication extends Application {
    constructor(options) {
      super(options);

      // enable app to send to a random agent
      this.messenger.sendRandom = (action, data) => {
        this.messenger.sendToAgent(action, data);
      };
      // enable agent to send to a random app
      agentMessenger.on('egg-ready', () => {
        agentMessenger.sendRandom = (action, data) => {
          agentMessenger.sendToApp(action, data);
        };
      });

      agentMessenger.send = new Proxy(agentMessenger.send, {
        apply: this._sendMessage.bind(this),
      });
    }
    _sendMessage(target, thisArg, [ action, data, to ]) {
      const appMessenger = this.messenger;
      setImmediate(() => {

        if (to === 'app') {
          appMessenger._onMessage({ action, data });
        } else {
          agentMessenger._onMessage({ action, data });
        }
      });
    }
    get messenger() {
      return this[MESSENGER];
    }
    set messenger(m) {
      m.send = new Proxy(m.send, {
        apply: this._sendMessage.bind(this),
      });
      this[MESSENGER] = m;
    }

    get [Symbol.for('egg#eggPath')]() { return path.join(__dirname, 'tmp'); }
  };
}
