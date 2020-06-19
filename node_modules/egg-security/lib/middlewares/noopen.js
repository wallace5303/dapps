'use strict';

const utils = require('../utils');

// @see http://blogs.msdn.com/b/ieinternals/archive/2009/06/30/internet-explorer-custom-http-headers.aspx
module.exports = options => {
  return async function noopen(ctx, next) {
    await next();

    const opts = utils.merge(options, ctx.securityOptions.noopen);
    if (utils.checkIfIgnore(opts, ctx)) return;

    ctx.set('x-download-options', 'noopen');
  };
};
