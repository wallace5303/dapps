/*!
 * humanize-byte - index.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var bytes = require('bytes');

module.exports = function (size) {
  if (typeof size === 'number') {
    return size;
  }

  return bytes(size);
}
