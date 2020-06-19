'use strict';

const is = require('is-type-of');
const url = require('url');
const { JSONP_CONFIG } = require('../../lib/private_key');

module.exports = {
  /**
   * return a middleware to enable jsonp response.
   * will do some security check inside.
   * @param  {Object} options jsonp options. can override `config.jsonp`.
   * @return {Function} jsonp middleware
   * @public
   */
  jsonp(options) {
    const defaultOptions = this.config.jsonp;
    options = Object.assign({}, defaultOptions, options);
    if (!Array.isArray(options.callback)) options.callback = [ options.callback ];

    const csrfEnable = this.plugins.security && this.plugins.security.enable // security enable
      && this.config.security.csrf && this.config.security.csrf.enable !== false // csrf enable
      && options.csrf; // jsonp csrf enabled

    const validateReferrer = options.whiteList && createValidateReferer(options.whiteList);

    if (!csrfEnable && !validateReferrer) {
      this.coreLogger.warn('[egg-jsonp] SECURITY WARNING!! csrf check and referrer check are both closed!');
    }
    /**
     * jsonp request security check, pass if
     *
     * 1. hit referrer white list
     * 2. or pass csrf check
     * 3. both check are disabled
     *
     * @param  {Context} ctx request context
     */
    function securityAssert(ctx) {
      // all disabled. don't need check
      if (!csrfEnable && !validateReferrer) return;

      // pass referrer check
      const referrer = ctx.get('referrer');
      if (validateReferrer && validateReferrer(referrer)) return;
      if (csrfEnable && validateCsrf(ctx)) return;

      const err = new Error('jsonp request security validate failed');
      err.referrer = referrer;
      err.status = 403;
      throw err;
    }

    return async function jsonp(ctx, next) {
      const jsonpFunction = getJsonpFunction(ctx.query, options.callback);

      ctx[JSONP_CONFIG] = {
        jsonpFunction,
        options,
      };

      // before handle request, must do some security checks
      securityAssert(ctx);

      await next();

      // generate jsonp body
      ctx.createJsonpBody(ctx.body);
    };
  },
};

function createValidateReferer(whiteList) {
  if (!Array.isArray(whiteList)) whiteList = [ whiteList ];

  return function(referrer) {
    let parsed = null;
    for (const item of whiteList) {
      if (is.regExp(item) && item.test(referrer)) {
        // regexp(/^https?:\/\/github.com\//): test the referrer with item
        return true;
      }

      parsed = parsed || url.parse(referrer);
      const hostname = parsed.hostname || '';

      if (item[0] === '.' &&
        (hostname.endsWith(item) || hostname === item.slice(1))) {
        // string start with `.`(.github.com): referrer's hostname must ends with item
        return true;
      } else if (hostname === item) {
        // string not start with `.`(github.com): referrer's hostname must strict equal to item
        return true;
      }
    }

    return false;
  };
}

function validateCsrf(ctx) {
  try {
    ctx.assertCsrf();
    return true;
  } catch (_) {
    return false;
  }
}

function getJsonpFunction(query, callbacks) {
  for (const callback of callbacks) {
    if (query[callback]) return query[callback];
  }
}
