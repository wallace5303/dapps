'use strict';

const compose = require('koa-compose');
const path = require('path');
const assert = require('assert');
const createMatch = require('egg-path-matching');

module.exports = (_, app) => {
  const options = app.config.security;
  const middlewares = [];
  const defaultMiddleware = (options.defaultMiddleware || '').split(',');

  if (options.match || options.ignore) {
    app.coreLogger.warn('[egg-security] Please set `match` or `ignore` on sub config');
  }

  // format csrf.cookieDomain
  const orginalCookieDomain = options.csrf.cookieDomain;
  if (orginalCookieDomain && typeof orginalCookieDomain !== 'function') {
    options.csrf.cookieDomain = () => orginalCookieDomain;
  }

  defaultMiddleware.forEach(middlewareName => {

    middlewareName = middlewareName.trim();

    const opt = options[middlewareName];
    assert(opt === false || typeof opt === 'object',
      `config.security.${middlewareName} must be an object, or false(if you turn it off)`);

    if (opt === false || opt && opt.enable === false) {
      return;
    }

    if (middlewareName === 'csrf' && opt.useSession && !app.plugins.session) {
      throw new Error('csrf.useSession enabled, but session plugin is disabled');
    }

    // use opt.match first (compatibility)
    if (opt.match && opt.ignore) {
      app.coreLogger.warn('[egg-security] `options.match` and `options.ignore` are both set, using `options.match`');
      opt.ignore = undefined;
    }
    if (!opt.ignore && opt.blackUrls) {
      app.deprecate('[egg-security] Please use `config.security.xframe.ignore` instead, `config.security.xframe.blackUrls` will be removed very soon');
      opt.ignore = opt.blackUrls;
    }
    opt.matching = createMatch(opt);

    const fn = require(path.join(__dirname, '../../lib/middlewares', middlewareName))(opt, app);
    middlewares.push(fn);
    app.coreLogger.info('[egg-security] use %s middleware', middlewareName);
  });
  app.coreLogger.info('[egg-security] compose %d middlewares into one security middleware',
    middlewares.length);

  return compose(middlewares);
};
