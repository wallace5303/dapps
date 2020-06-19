'use strict';

const debug = require('debug')('egg-security:csrf');
const typeis = require('type-is');
const utils = require('../utils');

module.exports = options => {
  return function csrf(ctx, next) {
    if (utils.checkIfIgnore(options, ctx)) {
      return next();
    }

    // ensure csrf token exists
    if ([ 'any', 'all', 'ctoken' ].includes(options.type)) {
      ctx.ensureCsrfSecret();
    }

    // ignore requests: get, head, options and trace
    const method = ctx.method;
    if (method === 'GET' ||
      method === 'HEAD' ||
      method === 'OPTIONS' ||
      method === 'TRACE') {
      return next();
    }

    if (options.ignoreJSON && typeis.is(ctx.get('content-type'), 'json')) {
      return next();
    }

    const body = ctx.request.body || {};
    debug('%s %s, got %j', ctx.method, ctx.url, body);
    ctx.assertCsrf();
    return next();
  };
};
