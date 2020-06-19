'use strict';

const utils = require('../utils');

module.exports = options => {
  return async function xframe(ctx, next) {
    await next();

    const opts = utils.merge(options, ctx.securityOptions.xframe);
    if (utils.checkIfIgnore(opts, ctx)) return;

    // DENY,SAMEORIGIN,ALLOW-FROM
    // https://developer.mozilla.org/en-US/docs/HTTP/X-Frame-Options?redirectlocale=en-US&redirectslug=The_X-FRAME-OPTIONS_response_header
    const value = opts.value || 'SAMEORIGIN';

    ctx.set('x-frame-options', value);
  };
};
