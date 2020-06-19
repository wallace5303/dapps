'use strict';

const co = require('co');
const is = require('is-type-of');
const stringify = require('json-stringify-safe');

const MAX_REQUEST_ID = Math.pow(2, 30); // avoid write big integer
const empty = () => {};

let id = 0;

function nextId() {
  id += 1;
  if (id >= MAX_REQUEST_ID) {
    id = 1;
  }
  return id;
}

/**
 * generate requestId
 *
 * @return {Number} requestId
 */
exports.nextId = nextId;

// for unittest
exports.setId = val => {
  id = val;
};

/**
 * event delegate
 *
 * @param {EventEmitter} from - from object
 * @param {EventEmitter} to - to object
 * @return {void}
 */
exports.delegateEvents = (from, to) => {
  // ignore the sdk-base defaultErrorHandler
  // https://github.com/node-modules/sdk-base/blob/master/index.js#L131
  if (from.listeners('error').length <= 1) {
    from.on('error', empty);
  }

  from.emit = new Proxy(from.emit, {
    apply(target, thisArg, args) {
      target.apply(from, args);
      to.emit.apply(to, args);
      return thisArg;
    },
  });
};

function formatKey(reg) {
  return stringify(reg);
}

/**
 * normalize object to string
 *
 * @param {Object} reg - reg object
 * @return {String} key
 */
exports.formatKey = formatKey;

/**
 * call a function, support common function, generator function, or a function returning promise
 *
 * @param {Function} fn - common function, generator function, or a function returning promise
 * @param {Array} args - args as fn() paramaters
 * @return {*} data returned by fn
 */
exports.callFn = async function(fn, args) {
  args = args || [];
  if (!is.function(fn)) return;
  if (is.generatorFunction(fn)) {
    return await co(function* () {
      return yield fn(...args);
    });
  }
  const r = fn(...args);
  if (is.promise(r)) {
    return await r;
  }
  return r;
};

exports.findMethodName = (descriptors, type) => {
  for (const method of descriptors.keys()) {
    const descriptor = descriptors.get(method);
    if (descriptor.type === 'delegate' && descriptor.to === type) {
      return method;
    }
  }
  return null;
};
