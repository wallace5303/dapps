'use strict';

const utils = require('../utils');

module.exports = options => {
  return async function xssProtection(ctx, next) {
    await next();

    const opts = utils.merge(options, ctx.securityOptions.xssProtection);
    if (utils.checkIfIgnore(opts, ctx)) return;

    ctx.set('x-xss-protection', opts.value);
  };
};
