'use strict';

const co = require('co');
const Base = require('./base');
const is = require('is-type-of');
const utils = require('../utils');
const SdkBase = require('sdk-base');
const random = require('utility').random;

// Symbol
const {
  logger,
  createClient,
  singleMode,
} = require('../symbol');
const _instances = new Map();

class InnerClient extends SdkBase {
  constructor(options = {}) {
    super(options);

    this._subData = new Map(); // <key, data>
    this._subSet = new Set();
    this._subListeners = new Map(); // <key, Array<Function>>
    this._transcode = options.transcode;
    this._realClient = options.createRealClient();
    this._closeMethodName = utils.findMethodName(options.descriptors, 'close');
    this._subscribeMethodName = utils.findMethodName(options.descriptors, 'subscribe');
    this._publishMethodName = utils.findMethodName(options.descriptors, 'publish');
    this._isReady = false;
    this._closeByUser = false;
    this._refCount = 1;

    // event delegate
    utils.delegateEvents(this._realClient, this);

    if (is.function(this._realClient.ready)) {
      this._realClient.ready(err => {
        if (err) {
          this.ready(err);
        } else {
          this._isReady = true;
          this.ready(true);
        }
      });
    } else {
      this._isReady = true;
      this.ready(true);
    }
  }

  ref() {
    this._refCount++;
  }

  get isLeader() {
    return true;
  }

  formatKey(reg) {
    return '$$inner$$__' + this.options.formatKey(reg);
  }

  subscribe(reg, listener) {
    const key = this.formatKey(reg);
    const transcode = this._transcode;
    const isBroadcast = this.options.isBroadcast;

    const listeners = this._subListeners.get(key) || [];
    listeners.push(listener);
    this._subListeners.set(key, listeners);

    if (!this._subSet.has(key)) {
      this._subSet.add(key);
      this._realClient[this._subscribeMethodName](reg, result => {
        const data = transcode.encode(result);
        this._subData.set(key, data);

        let fns = this._subListeners.get(key);
        if (!fns) {
          return;
        }

        const len = fns.length;
        // if isBroadcast equal to false, random pick one to notify
        if (!isBroadcast) {
          fns = [ fns[random(len)] ];
        }

        for (const fn of fns) {
          fn(transcode.decode(data));
        }
      });
    } else if (this._subData.has(key) && isBroadcast) {
      process.nextTick(() => {
        const data = this._subData.get(key);
        listener(transcode.decode(data));
      });
    }
  }

  unSubscribe(reg, listener) {
    const key = this.formatKey(reg);

    if (!listener) {
      this._subListeners.delete(key);
    } else {
      const listeners = this._subListeners.get(key) || [];
      const newListeners = [];

      for (const fn of listeners) {
        if (fn === listener) {
          continue;
        }
        newListeners.push(fn);
      }
      this._subListeners.set(key, newListeners);
    }
  }

  publish(reg) {
    this._realClient[this._publishMethodName](reg);
  }

  invoke(methodName, args, callback) {
    let method = this._realClient[methodName];
    // compatible with generatorFunction
    if (is.generatorFunction(method)) {
      method = co.wrap(method);
    }
    args.push(callback);
    const ret = method.apply(this._realClient, args);
    if (callback && is.promise(ret)) {
      ret.then(result => callback(null, result), err => callback(err))
        // to avoid uncaught exception in callback function, then cause unhandledRejection
        .catch(err => { this._errorHandler(err); });
    }
  }

  // emit error asynchronously
  _errorHandler(err) {
    setImmediate(() => {
      if (!this._closeByUser) {
        this.emit('error', err);
      }
    });
  }

  async close() {
    if (this._refCount > 0) {
      this._refCount--;
    }
    if (this._refCount > 0) return;

    this._closeByUser = true;

    if (this._realClient) {
      if (this._closeMethodName) {
        // support common function, generatorFunction, and function returning a promise
        await utils.callFn(this._realClient[this._closeMethodName].bind(this._realClient));
      }
    }
    this.emit('close');
  }
}


class SingleClient extends Base {
  get [singleMode]() {
    return true;
  }

  async [createClient]() {
    const options = this.options;
    let client;
    if (_instances.has(options.name)) {
      client = _instances.get(options.name);
      client.ref();
      return client;
    }
    client = new InnerClient(options);
    client.once('close', () => {
      _instances.delete(options.name);
      this[logger].info('[cluster#SingleClient] %s is closed.', options.name);
    });
    _instances.set(options.name, client);
    return client;
  }
}

module.exports = SingleClient;
