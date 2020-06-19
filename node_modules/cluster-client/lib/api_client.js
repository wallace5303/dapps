'use strict';

const cluster = require('./');
const utils = require('./utils');
const Base = require('sdk-base');
const is = require('is-type-of');

class APIClientBase extends Base {
  constructor(options) {
    options = options || {};
    super(options);

    const wrapper = (options.cluster || cluster)(
      this.DataClient, this.clusterOptions
    );
    for (const from in this.delegates) {
      const to = this.delegates[from];
      wrapper.delegate(from, to);
    }
    this._client = wrapper.create(options);
    utils.delegateEvents(this._client, this);

    if (!options.initMethod) {
      this._client.ready(err => {
        this.ready(err ? err : true);
      });
    }
  }

  get isClusterClientLeader() {
    return this._client.isClusterClientLeader;
  }

  close() {
    if (is.function(this._client.close)) {
      return this._client.close();
    }
    return cluster.close(this._client);
  }

  get DataClient() {
    /* istanbul ignore  next */
    throw new Error('[APIClient] DataClient is required');
  }

  /**
   * the cluster options
   *
   * @property {Object} APIClientBase#clusterOptions
   */
  get clusterOptions() {
    /* istanbul ignore  next */
    return {};
  }

  /**
   * the delegates map
   *
   * @example
   * ---------------------------
   * delegates => {
   *    subscribe: 'subscribe',
   *    foo: 'invoke',
   * }
   *
   * @property {Object} APIClientBase#delegates
   */
  get delegates() {
    /* istanbul ignore  next */
    return {};
  }
}

module.exports = APIClientBase;
