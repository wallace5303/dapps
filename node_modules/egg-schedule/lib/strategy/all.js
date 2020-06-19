'use strict';

const Strategy = require('./timer');

module.exports = class AllStrategy extends Strategy {
  handler() {
    this.sendAll();
  }
};
