'use strict';

const path = require('path');
const globby = require('globby');
const debug = require('debug')('egg-mock:prerequire');

const cwd = process.cwd();
const files = globby.sync([ 'app/**/*.js', 'config/**/*.js' ], { cwd });

for (const file of files) {
  try {
    debug('%s prerequire %s', process.pid, file);
    require(path.join(cwd, file));
  } catch (err) {
    debug('prerequire error %s', err.message);
  }
}
