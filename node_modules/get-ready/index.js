'use strict';

const is = require('is-type-of');

const IS_READY = Symbol('isReady');
const READY_CALLBACKS = Symbol('readyCallbacks');
const READY_ARG = Symbol('readyArg');

class Ready {

  constructor() {
    this[IS_READY] = false;
    this[READY_CALLBACKS] = [];
  }

  ready(flagOrFunction) {
    // register a callback
    if (flagOrFunction === undefined || is.function(flagOrFunction)) {
      return this.register(flagOrFunction);
    }
    // emit callbacks
    this.emit(flagOrFunction);
  }


  /**
   * Register a callback to the callback stack, it will be called when emit.
   * It will return promise when no argument passing.
   * @param {Function|Undefined} func - a callback
   * @return {Undefined|Promise} promise
   */
  register(func) {
    // support `this.ready().then(onready);` and `yield this.ready()`;
    if (!func) {
      return new Promise((resolve, reject) => {
        function func(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
        if (this[IS_READY]) {
          return func(this[READY_ARG]);
        }
        this[READY_CALLBACKS].push(func);
      });
    }

    // this.ready(fn)
    if (this[IS_READY]) {
      func(this[READY_ARG]);
    } else {
      this[READY_CALLBACKS].push(func);
    }
  }

  /**
   * Call the callbacks that has been registerd, and clean the callback stack.
   * If the flag is not false, it will be marked as ready. Then the callbacks will be called immediatly when register.
   * @param {Boolean|Error} flag - Set a flag whether it had been ready. If the flag is an error, it's also ready, but the callback will be called with argument `error`
   */
  emit(flag) {
    // this.ready(true);
    // this.ready(false);
    // this.ready(err);
    this[IS_READY] = flag !== false;
    this[READY_ARG] = flag instanceof Error ? flag : undefined;
    // this.ready(true)
    if (this[IS_READY]) {
      this[READY_CALLBACKS]
        .splice(0, Infinity)
        .forEach(callback => process.nextTick(() => callback(this[READY_ARG])));
    }
  }

  /**
   * @param {Object} obj - an object that be mixed
   */
  static mixin(obj) {
    if (!obj) return;
    const ready = new Ready();
    // delegate method
    obj.ready = flagOrFunction => ready.ready(flagOrFunction);
  }
}

function mixin(object) {
  Ready.mixin(object);
}

module.exports = mixin;
module.exports.mixin = mixin;
module.exports.Ready = Ready;
