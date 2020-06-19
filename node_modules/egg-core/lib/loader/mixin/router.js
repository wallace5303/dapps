'use strict';

const path = require('path');


module.exports = {

  /**
   * Load app/router.js
   * @function EggLoader#loadRouter
   * @param {Object} opt - LoaderOptions
   * @since 1.0.0
   */
  loadRouter() {
    this.timing.start('Load Router');
    // 加载 router.js
    this.loadFile(path.join(this.options.baseDir, 'app/router'));
    this.timing.end('Load Router');
  },
};
