'use strict';

const co = require('co');
const util = require('util');
const is = require('is-type-of');
const assert = require('assert');
const awaitEvent = require('await-event');
const awaitFirst = require('await-first');
const EventEmitter = require('events').EventEmitter;
const CLOSE_PROMISE = Symbol('base#closePromise');

class Base extends EventEmitter {
  constructor(options) {
    super();

    if (options && options.initMethod) {
      assert(is.function(this[options.initMethod]),
        `[sdk-base] this.${options.initMethod} should be a function.`);

      process.nextTick(() => {
        if (is.generatorFunction(this[options.initMethod])) {
          this[options.initMethod] = co.wrap(this[options.initMethod]);
        }
        const ret = this[options.initMethod]();
        assert(is.promise(ret), `[sdk-base] this.${options.initMethod} should return either a promise or a generator`);
        ret.then(() => this.ready(true))
          .catch(err => this.ready(err));
      });
    }
    this.options = options || {};
    this._ready = false;
    this._readyError = null;
    this._readyCallbacks = [];
    this._closed = false;

    // support `yield this.await('event')`
    this.await = awaitEvent;
    this.awaitFirst = awaitFirst;

    this.on('error', err => { this._defaultErrorHandler(err); });
  }

  _wrapListener(eventName, listener) {
    if (is.generatorFunction(listener)) {
      assert(eventName !== 'error', '[sdk-base] `error` event should not have a generator listener.');

      const newListener = (...args) => {
        co(function* () {
          yield listener(...args);
        }).catch(err => {
          err.name = 'EventListenerProcessError';
          this.emit('error', err);
        });
      };
      newListener.original = listener;
      return newListener;
    }
    return listener;
  }

  addListener(eventName, listener) {
    return super.addListener(eventName, this._wrapListener(eventName, listener));
  }

  on(eventName, listener) {
    return super.on(eventName, this._wrapListener(eventName, listener));
  }

  once(eventName, listener) {
    return super.once(eventName, this._wrapListener(eventName, listener));
  }

  prependListener(eventName, listener) {
    return super.prependListener(eventName, this._wrapListener(eventName, listener));
  }

  prependOnceListener(eventName, listener) {
    return super.prependOnceListener(eventName, this._wrapListener(eventName, listener));
  }

  removeListener(eventName, listener) {
    let target = listener;
    if (is.generatorFunction(listener)) {
      const listeners = this.listeners(eventName);
      for (const fn of listeners) {
        if (fn.original === listener) {
          target = fn;
          break;
        }
      }
    }
    return super.removeListener(eventName, target);
  }

  /**
   * detect sdk start ready or not
   * @return {Boolean} ready status
   */
  get isReady() {
    return this._ready;
  }

  /**
   * set ready state or onready callback
   *
   * @param {Boolean|Error|Function} flagOrFunction - ready state or callback function
   * @return {void|Promise} ready promise
   */
  ready(flagOrFunction) {
    if (arguments.length === 0) {
      // return a promise
      // support `this.ready().then(onready);` and `yield this.ready()`;
      return new Promise((resolve, reject) => {
        if (this._ready) {
          return resolve();
        } else if (this._readyError) {
          return reject(this._readyError);
        }
        this._readyCallbacks.push(err => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } else if (is.function(flagOrFunction)) {
      this._readyCallbacks.push(flagOrFunction);
    } else if (flagOrFunction instanceof Error) {
      this._ready = false;
      this._readyError = flagOrFunction;
      if (!this._readyCallbacks.length) {
        this.emit('error', flagOrFunction);
      }
    } else {
      this._ready = flagOrFunction;
    }

    if (this._ready || this._readyError) {
      this._readyCallbacks.splice(0, Infinity).forEach(callback => {
        process.nextTick(() => {
          callback(this._readyError);
        });
      });
    }
  }

  _defaultErrorHandler(err) {
    if (this.listeners('error').length > 1) {
      // ignore defaultErrorHandler
      return;
    }
    console.error('\n[%s][pid: %s][%s] %s: %s \nError Stack:\n  %s',
      Date(), process.pid, this.constructor.name, err.name,
      err.message, err.stack);

    // try to show addition property on the error object
    // e.g.: `err.data = {url: '/foo'};`
    const additions = [];
    for (const key in err) {
      if (key === 'name' || key === 'message') {
        continue;
      }

      additions.push(util.format('  %s: %j', key, err[key]));
    }
    if (additions.length) {
      console.error('Error Additions:\n%s', additions.join('\n'));
    }
    console.error();
  }

  close() {
    if (this._closed) {
      return Promise.resolve();
    }
    if (this[CLOSE_PROMISE]) {
      return this[CLOSE_PROMISE];
    }
    if (!this._close) {
      this._closed = true;
      return Promise.resolve();
    }
    let closeFunc = this._close;
    if (is.generatorFunction(closeFunc)) {
      closeFunc = co.wrap(closeFunc);
    }
    this[CLOSE_PROMISE] = closeFunc.apply(this);
    assert(is.promise(this[CLOSE_PROMISE]), '[sdk-base] this._close should return either a promise or a generator');
    return this[CLOSE_PROMISE]
      .then(() => {
        this._closed = true;
      })
      .catch(err => {
        this._closed = true;
        this.emit('error', err);
      });
  }
}

module.exports = Base;
// support es module
module.exports.default = Base;
