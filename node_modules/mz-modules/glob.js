'use strict';

const glob = require('glob');
const wrap = require('./lib/wrap');

module.exports = wrap(glob);
