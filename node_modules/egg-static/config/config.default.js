'use strict';

const path = require('path');

module.exports = appInfo => {
  const exports = {};

  /**
   * Static file serve
   *
   * @member Config#static
   * @property {String} prefix - `/public/` by default
   * @property {String} dir - static files store dir, `${baseDir}/app/public` by default
   * @property {Number} maxAge - cache max age, default is 0
   * @see https://github.com/koajs/static-cache
   */
  exports.static = {
    prefix: '/public/',
    dir: path.join(appInfo.baseDir, 'app/public'),
    // dirs: [ dir1, dir2 ] or [ dir1, { prefix: '/static2', dir: dir2 } ],
    // support lazy load
    dynamic: true,
    preload: false,
    buffer: false,
    maxFiles: 1000,
  };
  return exports;
};
