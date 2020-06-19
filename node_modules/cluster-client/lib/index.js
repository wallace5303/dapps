'use strict';

const is = require('is-type-of');
const symbols = require('./symbol');
const logger = require('./default_logger');
const transcode = require('./default_transcode');
const SingleClient = require('./wrapper/single');
const ClusterClient = require('./wrapper/cluster');
const { formatKey } = require('./utils');

const defaultOptions = {
  port: parseInt(process.env.NODE_CLUSTER_CLIENT_PORT || 7777),
  singleMode: process.env.NODE_CLUSTER_CLIENT_SINGLE_MODE === '1',
  maxWaitTime: 30000,
  responseTimeout: 3000,
  heartbeatInterval: 20000,
  autoGenerate: true,
  isBroadcast: true,
  logger,
  transcode,
  formatKey,
};
const autoGenerateMethods = [
  'subscribe',
  'unSubscribe',
  'publish',
  'close',
];

class ClientGenerator {
  /**
   * Cluster Client Generator
   *
   * @param {Function} clientClass - the client class
   * @param {Object} options
   *  - {Number} responseTimeout - response timeout, default is 3000
   *  - {Boolean} autoGenerate - whether generate delegate rule automatically, default is true
   *  - {Boolean} isBroadcast - whether broadcast subscrption result to all followers or just one, default is true
   *  - {Logger} logger - log instance
   *  - {Transcode} [transcode|JSON.stringify/parse]
   *    - {Function} encode - custom serialize method
   *    - {Function} decode - custom deserialize method
   *  - {Boolean} [isLeader|null] - specify whether current instance is leader
   *  - {Number} [maxWaitTime|30000] - leader startup max time (ONLY effective on isLeader is true)
   * @constructor
   */
  constructor(clientClass, options) {
    this._clientClass = clientClass;
    this._options = Object.assign({
      name: clientClass.prototype.constructor.name,
    }, defaultOptions, options);

    // wrapper descptions
    this._descriptors = new Map();
  }

  /**
   * override the property
   *
   * @param {String} name - property name
   * @param {Object} value - property value
   * @return {ClientGenerator} self
   */
  override(name, value) {
    this._descriptors.set(name, {
      type: 'override',
      value,
    });
    return this;
  }

  /**
   * delegate methods
   *
   * @param {String} from - method name
   * @param {String} to - delegate to subscribe|publish|invoke
   * @return {ClientGenerator} self
   */
  delegate(from, to) {
    to = to || 'invoke';
    this._descriptors.set(from, {
      type: 'delegate',
      to,
    });
    return this;
  }

  /**
   * create cluster client instance
   *
   * @return {Object} instance
   */
  create(...args) {
    const clientClass = this._clientClass;
    const proto = clientClass.prototype;
    const descriptors = this._descriptors;

    // auto generate description
    if (this._options.autoGenerate) {
      this._generateDescriptors();
    }

    function createRealClient() {
      return Reflect.construct(clientClass, args);
    }

    const ClientWrapper = this._options.singleMode ? SingleClient : ClusterClient;
    const client = new ClientWrapper(Object.assign({
      createRealClient,
      descriptors: this._descriptors,
    }, this._options));

    for (const name of descriptors.keys()) {
      let value;
      const descriptor = descriptors.get(name);
      switch (descriptor.type) {
        case 'override':
          value = descriptor.value;
          break;
        case 'delegate':
          if (/^invoke|invokeOneway$/.test(descriptor.to)) {
            if (is.generatorFunction(proto[name])) {
              value = function* (...args) {
                return yield cb => { client[symbols.invoke](name, args, cb); };
              };
            } else if (is.function(proto[name])) {
              if (descriptor.to === 'invoke') {
                value = (...args) => {
                  let cb;
                  if (is.function(args[args.length - 1])) {
                    cb = args.pop();
                  }
                  // whether callback or promise
                  if (cb) {
                    client[symbols.invoke](name, args, cb);
                  } else {
                    return new Promise((resolve, reject) => {
                      client[symbols.invoke](name, args, function(err) {
                        if (err) {
                          reject(err);
                        } else {
                          resolve.apply(null, Array.from(arguments).slice(1));
                        }
                      });
                    });
                  }
                };
              } else {
                value = (...args) => {
                  client[symbols.invoke](name, args);
                };
              }
            } else {
              throw new Error(`[ClusterClient] api: ${name} not implement in client`);
            }
          } else {
            value = client[Symbol.for(`ClusterClient#${descriptor.to}`)];
          }
          break;
        default:
          break;
      }
      Object.defineProperty(client, name, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    return client;
  }

  _generateDescriptors() {
    const clientClass = this._clientClass;
    const proto = clientClass.prototype;

    const needGenerateMethods = new Set(autoGenerateMethods);
    for (const entry of this._descriptors.entries()) {
      const key = entry[0];
      const value = entry[1];
      if (needGenerateMethods.has(key) ||
        (value.type === 'delegate' && needGenerateMethods.has(value.to))) {
        needGenerateMethods.delete(key);
      }
    }
    for (const method of needGenerateMethods.values()) {
      if (is.function(proto[method])) {
        this.delegate(method, method);
      }
    }

    const keys = Reflect.ownKeys(proto)
      .filter(key => typeof key !== 'symbol' &&
        !key.startsWith('_') &&
        !this._descriptors.has(key));

    for (const key of keys) {
      const descriptor = Reflect.getOwnPropertyDescriptor(proto, key);
      if (descriptor.value &&
        (is.generatorFunction(descriptor.value) || is.asyncFunction(descriptor.value))) {
        this.delegate(key);
      }
    }
  }
}

module.exports = function(clientClass, options) {
  return new ClientGenerator(clientClass, options);
};
