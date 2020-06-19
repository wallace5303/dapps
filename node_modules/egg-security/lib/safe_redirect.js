'use strict';

const utils = require('./utils.js');
const delegate = require('delegates');

module.exports = app => {

  /**
   * This is an unsafe redirection, and we WON'T check if the
   * destination url is safe or not.
   * Please DO NOT use this method unless in some very special cases,
   * otherwise there may be security vulnerabilities.
   *
   * @method Response#unsafeRedirect
   * @param {String} url URL to forward
   * @example
   * ```js
   * this.response.unsafeRedirect('http://www.domain.com');
   * this.unsafeRedirect('http://www.domain.com');
   * ```
   */
  app.response.unsafeRedirect = app.response.redirect;
  delegate(app.context, 'response').method('unsafeRedirect');
  /*eslint-disable */
  /**
   * A safe redirection, and we'll check if the URL is in
   * a safe domain or not.
   * We've overridden the default Koa's implementation by adding a
   * white list as the filter for that.
   *
   * @method Response#redirect
   * @param {String} url URL to forward
   * @example
   * ```js
   * this.response.redirect('/login');
   * this.redirect('/login');
   * ```
   */
  /* eslint-enable */
  app.response.redirect = function redirect(url, alt) {
    url = (url || '/').trim();

    // Process with `//`
    if (url[0] === '/' && url[1] === '/') {
      url = '/';
    }

    // if begin with '/', it means an internal jump
    if (url[0] === '/' && url[1] !== '\\') {
      return this.unsafeRedirect(url, alt);
    }

    const info = utils.getFromUrl(url) || {};

    const domainWhiteList = this.app.config.security.domainWhiteList;
    if (info.protocol !== 'http:' && info.protocol !== 'https:') {
      url = '/';
    } else if (!info.hostname) {
      url = '/';
    } else {
      if (domainWhiteList && domainWhiteList.length !== 0) {
        if (!this.ctx.isSafeDomain(info.hostname)) {
          const message = `a security problem has been detected for url "${url}", redirection is prohibited.`;
          if (process.env.NODE_ENV === 'production') {
            this.ctx.coreLogger.warn('[egg-security:redirect] %s', message);
            url = '/';
          } else {
            // Exception will be thrown out in a non-PROD env.
            return this.ctx.throw(500, message);
          }
        }
      }
    }
    this.unsafeRedirect(url);
  };
};
