'use strict';

module.exports = {
  /**
   * get current request locale
   * @member Context#locale
   * @return {String} lower case locale string, e.g.: 'zh-cn', 'en-us'
   */
  get locale() {
    return this.__getLocale();
  },

  set locale(l) {
    return this.__setLocale(l);
  },
};
