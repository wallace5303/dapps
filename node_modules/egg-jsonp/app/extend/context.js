'use strict';

const jsonpBody = require('jsonp-body');
const { JSONP_CONFIG } = require('../../lib/private_key');

module.exports = {
  /**
   * detect if response should be jsonp
   */
  get acceptJSONP() {
    return !!(this[JSONP_CONFIG] && this[JSONP_CONFIG].jsonpFunction);
  },

  /**
   * JSONP wrap body function
   * Set jsonp response wrap function, other plugin can use it.
   * If not necessary, please don't use this method in your application code.
   * @param {Object} body respones body
   * @private
   */
  createJsonpBody(body) {
    const jsonpConfig = this[JSONP_CONFIG];
    if (!jsonpConfig || !jsonpConfig.jsonpFunction) {
      this.body = body;
      return;
    }

    this.set('x-content-type-options', 'nosniff');
    this.type = 'js';
    body = body === undefined ? null : body;
    // protect from jsonp xss
    this.body = jsonpBody(body, jsonpConfig.jsonpFunction, jsonpConfig.options);
  },
};
