'use strict';

const assert = require('assert');

module.exports = {
  /**
   * set session external store
   *
   * ```js
   * app.sessionStore = {
   *   * get() {},
   *   * set() {},
   *   * destory() {},
   * };
   *
   * app.sessionStore = class SessionStore {
   *   constructor(app) {
   *   }
   *   * get() {},
   *   * set() {},
   *   * destroy() {},
   * }
   * ```
   * @param  {Class|Object} store session store class or instance
   */
  set sessionStore(store) {
    if (this.config.session.store && this.config.env !== 'unittest') {
      this.logger.warn('[egg-session] sessionStore already exists and will be overwrite');
    }

    // supoprt this.sesionStore = null to disable external store
    if (!store) {
      this.config.session.store = undefined;
      return;
    }

    if (typeof store === 'function') store = new store(this);
    assert(typeof store.get === 'function', 'store.get must be function');
    assert(typeof store.set === 'function', 'store.set must be function');
    assert(typeof store.destroy === 'function', 'store.destroy must be function');
    store.get = this.toAsyncFunction(store.get);
    store.set = this.toAsyncFunction(store.set);
    store.destroy = this.toAsyncFunction(store.destroy);
    this.config.session.store = store;
  },

  /**
   * get sessionStore
   *
   * @return {Object} session store instance
   */
  get sessionStore() {
    return this.config.session.store;
  },
};
