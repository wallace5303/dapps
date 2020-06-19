'use strict';

const methods = require('methods').map(method => {
  return method.toUpperCase();
});

module.exports = options => {
  options = options || {};
  options.allowedMethods = options.allowedMethods || [ 'POST' ];

  return function overrideMethod(ctx, next) {
    const orginalMethod = ctx.request.method;
    if (options.allowedMethods.indexOf(orginalMethod) === -1) return next();

    let method;
    // body support
    const body = ctx.request.body;
    if (body && body._method) {
      method = body._method.toUpperCase();
    } else {
      // header support
      const header = ctx.get('x-http-method-override');
      if (header) {
        method = header.toUpperCase();
      }
    }

    if (method) {
      // only allow supported methods
      // if you want to support other methods,
      // just create your own utility!
      if (methods.indexOf(method) === -1) {
        ctx.throw(400, `invalid overriden method: "${method}"`);
      }
      ctx.request.method = method;
    }

    return next();
  };
};
