'use strict';

const mkdirp = require('mkdirp');
const wrap = require('./lib/wrap');

module.exports = wrap(mkdirp);
