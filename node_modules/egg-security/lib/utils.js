'use strict';

const normalize = require('path').normalize;
const IP = require('ip');
const matcher = require('matcher');
const URL = require('url').URL;

/**
 * Check whether a domain is in the safe domain white list or not.
 * @param {String} domain The inputted domain.
 * @param {Array<string>} whiteList The white list for domain.
 * @return {Boolean} If the `domain` is in the white list, return true; otherwise false.
 */
exports.isSafeDomain = function isSafeDomain(domain, whiteList) {
  // domain must be string, otherwise return false
  if (typeof domain !== 'string') return false;
  // Ignore case sensitive first
  domain = domain.toLowerCase();
  // add prefix `.`, because all domains in white list start with `.`
  const hostname = '.' + domain;

  return whiteList.some(rule => {
    // Check whether we've got '*' as a wild character symbol
    if (rule.includes('*')) {
      return matcher.isMatch(domain, rule);
    }
    // If domain is an absolute path such as `http://...`
    // We can directly check whether it directly equals to `domain`
    // And we don't need to cope with `endWith`.
    if (domain === rule) return true;
    // ensure wwweggjs.com not match eggjs.com
    if (!/^\./.test(rule)) rule = `.${rule}`;
    return hostname.endsWith(rule);
  });
};

exports.isSafePath = function isSafePath(path, ctx) {
  path = '.' + path;
  if (path.indexOf('%') !== -1) {
    try {
      path = decodeURIComponent(path);
    } catch (e) {
      if (ctx.app.config.env === 'local' || ctx.app.config.env === 'unittest') {
        // not under production environment, output log
        ctx.coreLogger.warn('[egg-security: dta global block] : decode file path %s failed.', path);
      }
    }
  }
  const normalizePath = normalize(path);
  return !(normalizePath.startsWith('../') || normalizePath.startsWith('..\\'));
};

exports.checkIfIgnore = function checkIfIgnore(opts, ctx) {
  // check opts.enable first
  if (!opts.enable) return true;
  return !opts.matching(ctx);
};

const IP_RE = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const topDomains = {};
[ '.net.cn', '.gov.cn', '.org.cn', '.com.cn' ].forEach(function(item) {
  topDomains[item] = 2 - item.split('.').length;
});

exports.getCookieDomain = function getCookieDomain(hostname) {
  if (IP_RE.test(hostname)) {
    return hostname;
  }
  // app.test.domain.com => .test.domain.com
  // app.stable.domain.com => .domain.com
  // app.domain.com => .domain.com
  // domain=.domain.com;
  const splits = hostname.split('.');
  let index = -2;

  // only when `*.test.*.com` set `.test.*.com`
  if (splits.length >= 4 && splits[splits.length - 3] === 'test') {
    index = -3;
  }
  let domain = getDomain(splits, index);
  if (topDomains[domain]) {
    domain = getDomain(splits, index + topDomains[domain]);
  }
  return domain;
};

function getDomain(arr, index) {
  return '.' + arr.slice(index).join('.');
}

exports.merge = function merge(origin, opts) {
  if (!opts) return origin;
  const res = {};

  const originKeys = Object.keys(origin);
  for (let i = 0; i < originKeys.length; i++) {
    const key = originKeys[i];
    res[key] = origin[key];
  }

  const keys = Object.keys(opts);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    res[key] = opts[key];
  }
  return res;
};

exports.preprocessConfig = function(config) {
  // transfor ssrf.ipBlackList to ssrf.checkAddress
  // checkAddress has higher priority than ipBlackList
  const ssrf = config.ssrf;
  if (ssrf && ssrf.ipBlackList && !ssrf.checkAddress) {
    const containsList = ssrf.ipBlackList.map(getContains);
    ssrf.checkAddress = ip => {
      for (const contains of containsList) {
        if (contains(ip)) return false;
      }
      return true;
    };
  }

  // Make sure that `whiteList` or `protocolWhiteList` is case insensitive
  config.domainWhiteList = config.domainWhiteList || [];
  config.domainWhiteList = config.domainWhiteList.map(domain => domain.toLowerCase());

  config.protocolWhiteList = config.protocolWhiteList || [];
  config.protocolWhiteList = config.protocolWhiteList.map(protocol => protocol.toLowerCase());

  // Make sure refererWhiteList is case insensitive
  if (config.csrf && config.csrf.refererWhiteList) {
    config.csrf.refererWhiteList = config.csrf.refererWhiteList.map(ref => ref.toLowerCase());
  }

  // Directly converted to Set collection by a private property (not documented),
  // And we NO LONGER need to do conversion in `foreach` again and again in `surl.js`.
  config._protocolWhiteListSet = new Set(config.protocolWhiteList);
  config._protocolWhiteListSet.add('http');
  config._protocolWhiteListSet.add('https');
  config._protocolWhiteListSet.add('file');
  config._protocolWhiteListSet.add('data');
};

exports.getFromUrl = function(url, prop) {
  try {
    const parsed = new URL(url);
    return prop ? parsed[prop] : parsed;
  } catch (err) {
    return null;
  }
};

function getContains(ip) {
  if (IP.isV4Format(ip) || IP.isV6Format(ip)) {
    return _ip => ip === _ip;
  }
  return IP.cidrSubnet(ip).contains;
}
