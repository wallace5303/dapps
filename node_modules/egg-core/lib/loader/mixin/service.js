'use strict';

const path = require('path');


module.exports = {

  /**
   * Load app/service
   * @function EggLoader#loadService
   * @param {Object} opt - LoaderOptions
   * @since 1.0.0
   */
  loadService(opt) {
    this.timing.start('Load Service');
    // 载入到 app.serviceClasses
    opt = Object.assign({
      call: true,
      caseStyle: 'lower',
      fieldClass: 'serviceClasses',
      directory: this.getLoadUnits().map(unit => path.join(unit.path, 'app/service')),
    }, opt);
    const servicePaths = opt.directory;
    this.loadToContext(servicePaths, 'service', opt);
    this.timing.end('Load Service');
  },

};
