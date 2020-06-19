'use strict';

const assert = require('assert');
const is = require('is-type-of');
const cluster = require('./lib');
const symbols = require('./lib/symbol');
const APIClientBase = require('./lib/api_client');

/**
 * Create an Wrapper
 *
 * @param {Function} clientClass - client class
 * @param {Object} options - wrapper options
 * @return {ClientWrapper} wrapper
 */
module.exports = cluster;

/**
 * Close a ClusterClient
 *
 * @param {Object} client - ClusterClient instance to be closed
 * @return {Promise} returns a promise which will be resolved after fully closed
 */
module.exports.close = client => {
  assert(is.function(client[symbols.close]), '[cluster#close] client should be instanceof ClusterClient');
  return client[symbols.close]();
};

/**
 * API Client SuperClass
 *
 * @example
 * ---------------------------------------------
 * class ClusterClient extends APIClientBase {
 *   get DataClient() {
 *     return require('./supports/client');
 *   }
 *   get delegates() {
 *     return {
 *       unPublish: 'invokeOneway',
 *     };
 *   }
 *   get clusterOptions() {
 *     return {
 *       responseTimeout: 1000,
 *       port,
 *     };
 *   }
 *   subscribe(...args) {
 *     return this._client.subscribe(...args);
 *   }
 *   unSubscribe(...args) {
 *     return this._client.unSubscribe(...args);
 *   }
 *   publish(...args) {
 *     return this._client.publish(...args);
 *   }
 *   unPublish(...args) {
 *     return this._client.unPublish(...args);
 *   }
 *   close() {
 *     return this._client.close();
 *   }
 * }
 */
module.exports.APIClientBase = APIClientBase;
