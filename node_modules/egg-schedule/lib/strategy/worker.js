'use strict';

const Strategy = require('./timer');

module.exports = class WorkerStrategy extends Strategy {
  handler() {
    this.sendOne();
  }
};
