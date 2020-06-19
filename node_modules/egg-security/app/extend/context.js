'use strict';

const safeCurl = require('../../lib/extend/safe_curl');
const isSafeDomainUtil = require('../../lib/utils').isSafeDomain;
const nanoid = require('nanoid/non-secure');
const Tokens = require('csrf');
const debug = require('debug')('egg-security:context');
const utils = require('../../lib/utils');

const tokens = new Tokens();

const CSRF_SECRET = Symbol('egg-security#CSRF_SECRET');
const _CSRF_SECRET = Symbol('egg-security#_CSRF_SECRET');
const NEW_CSRF_SECRET = Symbol('egg-security#NEW_CSRF_SECRET');
const LOG_CSRF_NOTICE = Symbol('egg-security#LOG_CSRF_NOTICE');
const INPUT_TOKEN = Symbol('egg-security#INPUT_TOKEN');
const NONCE_CACHE = Symbol('egg-security#NONCE_CACHE');
const SECURITY_OPTIONS = Symbol('egg-security#SECURITY_OPTIONS');
const CSRF_REFERER_CHECK = Symbol('egg-security#CSRF_REFERER_CHECK');
const CSRF_CTOKEN_CHECK = Symbol('egg-security#CSRF_CTOKEN_CHECK');

function findToken(obj, keys) {
  if (!obj) return;
  if (!keys || !keys.length) return;
  if (typeof keys === 'string') return obj[keys];
  for (const key of keys) {
    if (obj[key]) return obj[key];
  }
}

module.exports = {
  get securityOptions() {
    if (!this[SECURITY_OPTIONS]) {
      this[SECURITY_OPTIONS] = {};
    }
    return this[SECURITY_OPTIONS];
  },

  /**
   * Check whether the specific `domain` is in / matches the whiteList or not.
   * @param {string} domain The assigned domain.
   * @return {boolean} If the domain is in / matches the whiteList, return true;
   * otherwise false.
   */
  isSafeDomain(domain) {
    const domainWhiteList = this.app.config.security.domainWhiteList;
    return isSafeDomainUtil(domain, domainWhiteList);
  },

  // Add nonce, random characters will be OK.
  // https://w3c.github.io/webappsec/specs/content-security-policy/#nonce_source

  get nonce() {
    if (!this[NONCE_CACHE]) {
      this[NONCE_CACHE] = nanoid(16);
    }
    return this[NONCE_CACHE];
  },

  /**
   * get csrf token, general use in template
   * @return {String} csrf token
   * @public
   */
  get csrf() {
    // csrfSecret can be rotate, use NEW_CSRF_SECRET first
    const secret = this[NEW_CSRF_SECRET] || this[CSRF_SECRET];
    debug('get csrf token, NEW_CSRF_SECRET: %s, _CSRF_SECRET: %s', this[NEW_CSRF_SECRET], this[CSRF_SECRET]);
    //  In order to protect against BREACH attacks,
    //  the token is not simply the secret;
    //  a random salt is prepended to the secret and used to scramble it.
    //  http://breachattack.com/
    return secret ? tokens.create(secret) : '';
  },

  /**
   * get csrf secret from session or cookie
   * @return {String} csrf secret
   * @private
   */
  get [CSRF_SECRET]() {
    if (this[_CSRF_SECRET]) return this[_CSRF_SECRET];
    let { useSession, cookieName, sessionName } = this.app.config.security.csrf;
    // get secret from session or cookie
    if (useSession) {
      this[_CSRF_SECRET] = this.session[sessionName] || '';
    } else {
      // cookieName support array. so we can change csrf cookie name smoothly
      if (!Array.isArray(cookieName)) cookieName = [ cookieName ];
      for (const name of cookieName) {
        this[_CSRF_SECRET] = this.cookies.get(name, { signed: false }) || '';
        if (this[_CSRF_SECRET]) break;
      }
    }
    return this[_CSRF_SECRET];
  },

  /**
   * ensure csrf secret exists in session or cookie.
   * @param {Boolean} rotate reset secret even if the secret exists
   * @public
   */
  ensureCsrfSecret(rotate) {
    if (this[CSRF_SECRET] && !rotate) return;
    debug('ensure csrf secret, exists: %s, rotate; %s', this[CSRF_SECRET], rotate);
    const secret = tokens.secretSync();
    this[NEW_CSRF_SECRET] = secret;
    let { useSession, sessionName, cookieDomain, cookieName } = this.app.config.security.csrf;

    if (useSession) {
      this.session[sessionName] = secret;
    } else {
      const cookieOpts = {
        domain: cookieDomain && cookieDomain(this),
        signed: false,
        httpOnly: false,
        overwrite: true,
      };
      // cookieName support array. so we can change csrf cookie name smoothly
      if (!Array.isArray(cookieName)) cookieName = [ cookieName ];
      for (const name of cookieName) {
        this.cookies.set(name, secret, cookieOpts);
      }
    }
  },

  get [INPUT_TOKEN]() {
    const { headerName, bodyName, queryName } = this.app.config.security.csrf;
    const token = findToken(this.query, queryName) || findToken(this.request.body, bodyName) ||
      (headerName && this.get(headerName));
    debug('get token %s, secret', token, this[CSRF_SECRET]);
    return token;
  },

  /**
   * rotate csrf secret exists in session or cookie.
   * must rotate the secret when user login
   * @public
   */
  rotateCsrfSecret() {
    if (!this[NEW_CSRF_SECRET] && this[CSRF_SECRET]) {
      this.ensureCsrfSecret(true);
    }
  },

  /**
   * assert csrf token/referer is present
   * @public
   */
  assertCsrf() {
    if (utils.checkIfIgnore(this.app.config.security.csrf, this)) {
      debug('%s, ignore by csrf options', this.path);
      return;
    }

    const { type } = this.app.config.security.csrf;
    let message;
    const messages = [];
    switch (type) {
      case 'ctoken':
        message = this[CSRF_CTOKEN_CHECK]();
        if (message) this.throw(403, message);
        break;
      case 'referer':
        message = this[CSRF_REFERER_CHECK]();
        if (message) this.throw(403, message);
        break;
      case 'all':
        message = this[CSRF_CTOKEN_CHECK]();
        if (message) this.throw(403, message);
        message = this[CSRF_REFERER_CHECK]();
        if (message) this.throw(403, message);
        break;
      case 'any':
        message = this[CSRF_CTOKEN_CHECK]();
        if (!message) return;
        messages.push(message);
        message = this[CSRF_REFERER_CHECK]();
        if (!message) return;
        messages.push(message);
        this.throw(403, `both ctoken and referer check error: ${messages.join(', ')}`);
        break;
      default:
        this.throw(`invalid type ${type}`);
    }
  },

  [CSRF_CTOKEN_CHECK]() {
    if (!this[CSRF_SECRET]) {
      debug('missing csrf token');
      this[LOG_CSRF_NOTICE]('missing csrf token');
      return 'missing csrf token';
    }
    const token = this[INPUT_TOKEN];
    // AJAX requests get csrf token from cookie, in this situation token will equal to secret
    // synchronize form requests' token always changing to protect against BREACH attacks
    if (token !== this[CSRF_SECRET] && !tokens.verify(this[CSRF_SECRET], token)) {
      debug('verify secret and token error');
      this[LOG_CSRF_NOTICE]('invalid csrf token');
      return 'invalid csrf token';
    }
  },

  [CSRF_REFERER_CHECK]() {
    const { refererWhiteList } = this.app.config.security.csrf;
    const referer = (this.headers.referer || '').toLowerCase();
    if (!referer) {
      debug('missing csrf referer');
      this[LOG_CSRF_NOTICE]('missing csrf referer');
      return 'missing csrf referer';
    }

    const host = utils.getFromUrl(referer, 'host');
    const domainList = refererWhiteList.concat(this.host);
    if (!host || !utils.isSafeDomain(host, domainList)) {
      debug('verify referer error');
      this[LOG_CSRF_NOTICE]('invalid csrf referer');
      return 'invalid csrf referer';
    }
  },

  [LOG_CSRF_NOTICE](msg) {
    if (this.app.config.env === 'local') {
      this.logger.warn(`${msg}. See https://eggjs.org/zh-cn/core/security.html#安全威胁csrf的防范`);
    }
  },

  safeCurl,
};
