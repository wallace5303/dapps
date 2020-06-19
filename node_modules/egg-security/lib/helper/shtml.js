'use strict';

const isSafeDomain = require('../utils').isSafeDomain;
const xss = require('xss');
const BUILD_IN_ON_TAG_ATTR = Symbol('buildInOnTagAttr');
const utils = require('../utils');

// default rule: https://github.com/leizongmin/js-xss/blob/master/lib/default.js
// add domain filter based on xss module
// custom options http://jsxss.com/zh/options.html
// eg: support a tag，filter attributes except for title : whiteList: {a: ['title']}
module.exports = function shtml(val) {
  if (typeof val !== 'string') return val;

  const securityOptions = this.ctx.securityOptions || {};
  const shtmlConfig = utils.merge(this.app.config.helper.shtml, securityOptions.shtml);
  const domainWhiteList = this.app.config.security.domainWhiteList;
  const app = this.app;
  // filter href and src attribute if not in domain white list
  if (!shtmlConfig[BUILD_IN_ON_TAG_ATTR]) {
    shtmlConfig[BUILD_IN_ON_TAG_ATTR] = function(tag, name, value, isWhiteAttr) {
      if (isWhiteAttr && (name === 'href' || name === 'src')) {
        if (!value) {
          return;
        }

        value = String(value);

        if (value[0] === '/' || value[0] === '#') {
          return;
        }

        const hostname = utils.getFromUrl(value, 'hostname');
        if (!hostname) {
          return;
        }

        // If we don't have our hostname in the app.security.domainWhiteList,
        // Just check for `shtmlConfig.domainWhiteList` and `ctx.whiteList`.
        if (!isSafeDomain(hostname, domainWhiteList)) {
          // Check for `shtmlConfig.domainWhiteList` first (duplicated now)
          if (shtmlConfig.domainWhiteList && shtmlConfig.domainWhiteList.length !== 0) {
            app.deprecate('[egg-security] `config.helper.shtml.domainWhiteList` has been deprecate. Please use `config.security.domainWhiteList` instead.');
            shtmlConfig.domainWhiteList = shtmlConfig.domainWhiteList.map(domain => domain.toLowerCase());
            if (!isSafeDomain(hostname, shtmlConfig.domainWhiteList)) {
              return '';
            }
          } else {
            return '';
          }
        }
      }
    };

    // avoid overriding user configuration 'onTagAttr'
    if (shtmlConfig.onTagAttr) {
      const original = shtmlConfig.onTagAttr;
      shtmlConfig.onTagAttr = function() {
        const result = original.apply(this, arguments);
        if (result !== undefined) {
          return result;
        }
        return shtmlConfig[BUILD_IN_ON_TAG_ATTR].apply(this, arguments);

      };
    } else {
      shtmlConfig.onTagAttr = shtmlConfig[BUILD_IN_ON_TAG_ATTR];
    }
  }

  return xss(val, shtmlConfig);
};
