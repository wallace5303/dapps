'use strict';

const Logger = require('../logger');
const ConsoleTransport = require('../transports/console');
const utils = require('../utils');

/**
 * Terminal Logger, send log to console.
 */
class ConsoleLogger extends Logger {

  /**
   * @constructor
   * @param {Object} options
   * - {String} [encoding] - log string encoding, default is 'utf8'
   */
  constructor(options) {
    super(options);

    this.set('console', new ConsoleTransport({
      level: this.options.level,
      formatter: utils.consoleFormatter,
    }));
  }

  get defaults() {
    return {
      encoding: 'utf8',
      level: process.env.NODE_ENV === 'production' ? 'INFO' : 'WARN',
    };
  }

}

module.exports = ConsoleLogger;
