'use strict';

const koajwt = require('koa-jwt2');
const UnauthorizedError = require('koa-jwt2/lib/errors/UnauthorizedError');
const jwt = require('jsonwebtoken');
const JWT = Symbol('Application#jwt');

module.exports = {
  get jwt() {
    if (!this[JWT]) {
      const config = this.config.jwt;
      this[JWT] = koajwt(config);

      this[JWT].sign = (payload, secret, options, callback) => {
        if (typeof secret !== 'string') {
          callback = options;
          options = secret || {};
          secret = config.secret;
        } else if (typeof options === 'function') {
          callback = options;
          options = {};
        }

        return jwt.sign(
          payload,
          secret,
          Object.assign({}, config.sign || {}, options),
          callback
        );
      };

      this[JWT].verify = (token, secret, options, callback) => {
        if (typeof secret !== 'string') {
          callback = options;
          options = secret || {};
          secret = config.secret;
        } else if (typeof options === 'function') {
          callback = options;
          options = {};
        }

        return jwt.verify(
          token,
          secret,
          Object.assign({}, config.verify || {}, options),
          callback
        );
      };

      this[JWT].decode = jwt.decode;
      this[JWT].UnauthorizedError = UnauthorizedError;
    }
    return this[JWT];
  },
};
