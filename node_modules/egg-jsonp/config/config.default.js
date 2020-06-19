'use strict';

/**
 * jsonp options
 * @member Config#jsonp
 * @property {String} callback - jsonp callback method key, default to `['_callback', 'callback' ]`
 * @property {Number} limit - callback method name's max length, default to `50`
 * @property {Boolean} csrf - enable csrf check or not. default to false
 * @property {String|RegExp|Array} whiteList - referrer white list
 */
exports.jsonp = {
  limit: 50,
  callback: [ '_callback', 'callback' ],
  csrf: false,
  whiteList: undefined,
};
