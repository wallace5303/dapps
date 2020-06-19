'use strict';

const rimraf = require('rimraf');
const wrap = require('./lib/wrap');

module.exports = wrap(rimraf);
