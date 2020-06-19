'use strict';

/**
 * safe curl with ssrf protect
 * @param {String} url request url
 * @param {Object} options request options
 * @return {Promise} response
 */
module.exports = function safeCurl(url, options = {}) {
  const config = this.config || this.app.config;
  if (config.security.ssrf && config.security.ssrf.checkAddress) {
    options.checkAddress = config.security.ssrf.checkAddress;
  } else {
    this.logger.warn('[egg-security] please configure `config.security.ssrf` first');
  }

  return this.curl(url, options);
};
