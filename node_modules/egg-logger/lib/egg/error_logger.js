'use strict';

const Logger = require('./logger');
const levels = require('../level');
const utils = require('../utils');


/**
 * Error Logger, only print `ERROR` level log.
 * level and consoleLevel should >= `ERROR` level.
 */
class ErrorLogger extends Logger {
  constructor(options) {
    options = options || {};
    options.level = getDefaultLevel(options.level);
    options.consoleLevel = getDefaultLevel(options.consoleLevel);
    super(options);
  }
}

module.exports = ErrorLogger;

function getDefaultLevel(level) {
  level = utils.normalizeLevel(level);

  if (level === undefined) {
    return levels.ERROR;
  }

  return level > levels.ERROR ? level : levels.ERROR;
}
