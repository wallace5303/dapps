'use strict';

const ViewManager = require('../../lib/view_manager');
const VIEW = Symbol('Application#view');

module.exports = {
  /**
   * Retrieve ViewManager instance
   * @member {ViewManager} Application#view
   */
  get view() {
    if (!this[VIEW]) {
      this[VIEW] = new ViewManager(this);
    }
    return this[VIEW];
  },
};
