'use strict';

const pump = require('pump');
const wrap = require('./lib/wrap');

module.exports = wrap(pump);
