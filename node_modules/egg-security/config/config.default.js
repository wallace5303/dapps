'use strict';

module.exports = () => {

  const exports = {};

  /**
   * security options
   * @member Config#security
   * @property {String} defaultMiddleware - default open security middleware
   * @property {Object} csrf - whether defend csrf attack
   * @property {Object} xframe - whether enable X-Frame-Options response header, default SAMEORIGIN
   * @property {Object} hsts - whether enable Strict-Transport-Security response header, default is one year
   * @property {Object} methodnoallow - whether enable Http Method filter
   * @property {Object} noopen - whether enable IE automaticlly download open
   * @property {Object} nosniff -  whether enable IE8 automaticlly dedect mime
   * @property {Object} xssProtection -  whether enable IE8 XSS Filter, default is open
   * @property {Object} csp - content security policy config
   * @property {Object} referrerPolicy - referrer policy config
   * @property {Object} dta - auto avoid directory traversal attack
   * @property {Array} domainWhiteList - domain white list
   * @property {Array} protocolWhiteList - protocal white list
   */
  exports.security = {
    domainWhiteList: [],
    protocolWhiteList: [],
    defaultMiddleware: 'csrf,hsts,methodnoallow,noopen,nosniff,csp,xssProtection,xframe,dta',

    csrf: {
      enable: true,

      // can be ctoken or referer or all
      type: 'ctoken',
      ignoreJSON: false,

      // These config works when using ctoken type
      useSession: false,
      // can be function(ctx) or String
      cookieDomain: undefined,
      cookieName: 'csrfToken',
      sessionName: 'csrfToken',
      headerName: 'x-csrf-token',
      bodyName: '_csrf',
      queryName: '_csrf',

      // These config works when using referer type
      refererWhiteList: [
        // 'eggjs.org'
      ],
    },

    xframe: {
      enable: true,
      // 'SAMEORIGIN', 'DENY' or 'ALLOW-FROM http://example.jp'
      value: 'SAMEORIGIN',
    },

    hsts: {
      enable: false,
      maxAge: 365 * 24 * 3600,
      includeSubdomains: false,
    },

    dta: {
      enable: true,
    },

    methodnoallow: {
      enable: true,
    },

    noopen: {
      enable: true,
    },

    nosniff: {
      enable: true,
    },

    referrerPolicy: {
      enable: false,
      value: 'no-referrer-when-downgrade',
    },

    xssProtection: {
      enable: true,
      value: '1; mode=block',
    },

    csp: {
      enable: false,
      policy: {},
    },

    ssrf: {
      ipBlackList: null,
      checkAddress: null,
    },
  };

  exports.helper = {
    shtml: {
    },
  };

  return exports;
};
