'use strict';

const methods = require('methods');
const METHODS_NOT_ALLOWED = [ 'trace', 'track' ];
const safeHttpMethodsMap = {};

for (const method of methods) {
  if (!METHODS_NOT_ALLOWED.includes(method)) {
    safeHttpMethodsMap[method.toUpperCase()] = true;
  }
}

// https://www.owasp.org/index.php/Cross_Site_Tracing
// http://jsperf.com/find-by-map-with-find-by-array
module.exports = () => {
  return function notAllow(ctx, next) {
    // ctx.method is upper case
    if (!safeHttpMethodsMap[ctx.method]) {
      ctx.throw(405);
    }
    return next();
  };
};
