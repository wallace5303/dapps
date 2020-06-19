'use strict';

const is = require('is-type-of');
const path = require('path');

const LOAD_BOOT_HOOK = Symbol('Loader#loadBootHook');

module.exports = {

  /**
   * load app.js
   *
   * @example
   * - old:
   *
   * ```js
   * module.exports = function(app) {
   *   doSomething();
   * }
   * ```
   *
   * - new:
   *
   * ```js
   * module.exports = class Boot {
   *   constructor(app) {
   *     this.app = app;
   *   }
   *   configDidLoad() {
   *     doSomething();
   *   }
   * }
   * @since 1.0.0
   */
  loadCustomApp() {
    this[LOAD_BOOT_HOOK]('app');
    this.lifecycle.triggerConfigWillLoad();
  },

  /**
   * Load agent.js, same as {@link EggLoader#loadCustomApp}
   */
  loadCustomAgent() {
    this[LOAD_BOOT_HOOK]('agent');
    this.lifecycle.triggerConfigWillLoad();
  },

  // FIXME: no logger used after egg removed
  loadBootHook() {
    // do nothing
  },

  [LOAD_BOOT_HOOK](fileName) {
    this.timing.start(`Load ${fileName}.js`);
    for (const unit of this.getLoadUnits()) {
      const bootFilePath = this.resolveModule(path.join(unit.path, fileName));
      if (!bootFilePath) {
        continue;
      }
      const bootHook = this.requireFile(bootFilePath);
      if (is.class(bootHook)) {
        bootHook.prototype.fullPath = bootFilePath;
        // if is boot class, add to lifecycle
        this.lifecycle.addBootHook(bootHook);
      } else if (is.function(bootHook)) {
        // if is boot function, wrap to class
        // for compatibility
        this.lifecycle.addFunctionAsBootHook(bootHook);
      } else {
        this.options.logger.warn('[egg-loader] %s must exports a boot class', bootFilePath);
      }
    }
    // init boots
    this.lifecycle.init();
    this.timing.end(`Load ${fileName}.js`);
  },
};
