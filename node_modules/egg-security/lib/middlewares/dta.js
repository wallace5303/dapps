'use strict';

// https://en.wikipedia.org/wiki/Directory_traversal_attack
const isSafePath = require('../utils').isSafePath;

module.exports = () => {
  return function dta(ctx, next) {
    const path = ctx.path;
    if (!isSafePath(path, ctx)) {
      ctx.throw(400);
    }
    return next();
  };
};
