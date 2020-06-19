'use strict';

// try to use eggUtils.getCalleeFromStack
// ignore it if egg-core module not found
let eggUtils;
try {
  eggUtils = require('egg-core').utils;
  if (!eggUtils) {
    // try to support egg-core@3
    eggUtils = require('egg-core/lib/utils');
  }
} catch (_) {
  // ignore eggUtils
}

module.exports = {
  runInBackground(scope) {
    /* istanbul ignore next */
    const taskName = scope._name || scope.name || (eggUtils && eggUtils.getCalleeFromStack(true));
    if (taskName) {
      scope._name = taskName;
    }

    const promise = this._runInBackground(scope);
    this.app._backgroundTasks.push(promise);
  },
};
