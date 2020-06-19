'use strict';

const range = require('koa-range');
const compose = require('koa-compose');
const staticCache = require('koa-static-cache');
const assert = require('assert');
const mkdirp = require('mkdirp');
const LRU = require('ylru');
const is = require('is-type-of');

module.exports = (options, app) => {
  let dirs = options.dir;
  if (!is.array(dirs)) dirs = [ dirs ];

  const prefixs = [];

  function rangeMiddleware(ctx, next) {
    // if match static file, and use range middleware.
    const isMatch = prefixs.some(p => ctx.path.startsWith(p));
    if (isMatch) {
      return range(ctx, next);
    }
    return next();
  }

  const middlewares = [ rangeMiddleware ];

  for (const dirObj of dirs) {
    assert(is.object(dirObj) || is.string(dirObj), '`config.static.dir` must be `string | Array<string|object>`.');

    let newOptions;

    if (is.string(dirObj)) {
      // copy origin options to new options ensure the safety of objects
      newOptions = Object.assign({}, options, { dir: dirObj });
    } else {
      assert(is.string(dirObj.dir), '`config.static.dir` should contains `[].dir` property when object style.');
      newOptions = Object.assign({}, options, dirObj);
    }

    if (newOptions.dynamic && !newOptions.files) {
      newOptions.files = new LRU(newOptions.maxFiles);
    }

    if (newOptions.prefix) {
      prefixs.push(newOptions.prefix);
    }

    // ensure directory exists
    mkdirp.sync(newOptions.dir);

    app.loggers.coreLogger.info('[egg-static] starting static serve %s -> %s', newOptions.prefix, newOptions.dir);

    middlewares.push(staticCache(newOptions));
  }

  return compose(middlewares);
};
