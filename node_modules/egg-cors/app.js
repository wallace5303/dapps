'use strict';

// there is no global.URL in node 8
const URL = require('url').URL;

module.exports = app => {
  // put before other core middlewares
  app.config.coreMiddlewares.unshift('cors');

  // if security plugin enabled, and origin config is not provided, will only allow safe domains support CORS.
  app.config.cors.origin = app.config.cors.origin || function corsOrigin(ctx) {
    // origin is {protocol}{hostname}{port}...
    const origin = ctx.get('origin');
    if (!origin) return '';

    if (typeof ctx.isSafeDomain !== 'function') return origin;

    let parsedUrl;
    try {
      parsedUrl = new URL(origin);
    } catch (err) {
      return '';
    }

    if (ctx.isSafeDomain(parsedUrl.hostname) || ctx.isSafeDomain(origin)) {
      return origin;
    }
    return '';
  };
};
