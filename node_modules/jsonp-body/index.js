/**!
 * jsonp-body - index.js
 *
 * Copyright(c) fengmk2 and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

'use strict';

/**
 * Module dependencies.
 */

module.exports = jsonp;

function jsonp(obj, callback, options) {
  // fixup callback when `this.query.callback` return Array
  if (Array.isArray(callback)) {
    callback = callback[0];
  }

  options = options || {};
  var limit = options.limit || 512;

  // JSON parse vs eval fix. @see https://github.com/rack/rack-contrib/pull/37
  var body = JSON.stringify(obj, options.replacer, options.space)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  if (typeof callback !== 'string' || callback.length === 0) {
    return body;
  }

  // limit callback length
  if (callback.length > limit) {
    callback = callback.substring(0, limit);
  }

  // Only allow "[","]","a-zA-Z0123456789_", "$" and "." characters.
  var cb = callback.replace(/[^\[\]\w$.]/g, '');

  // the /**/ is a specific security mitigation for "Rosetta Flash JSONP abuse"
  // @see https://web.nvd.nist.gov/view/vuln/detail?vulnId=CVE-2014-4671
  // @see http://miki.it/blog/2014/7/8/abusing-jsonp-with-rosetta-flash/
  // @see http://drops.wooyun.org/tips/2554
  return '/**/ typeof ' + cb + ' === \'function\' && ' + cb + '(' + body + ');';
}
