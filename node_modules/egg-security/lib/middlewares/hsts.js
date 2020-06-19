'use strict';

const utils = require('../utils');

// Set Strict-Transport-Security header
module.exports = options => {
  return async function hsts(ctx, next) {
    await next();

    const opts = utils.merge(options, ctx.securityOptions.hsts);
    if (utils.checkIfIgnore(opts, ctx)) return;

    let val = 'max-age=' + opts.maxAge;
    // If opts.includeSubdomains is defined,
    // the rule is also valid for all the sub domains of the website
    if (opts.includeSubdomains) {
      val += '; includeSubdomains';
    }
    ctx.set('strict-transport-security', val);
  };
};
