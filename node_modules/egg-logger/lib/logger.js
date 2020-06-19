'use strict';

const util = require('util');
const utils = require('./utils');
const depd = require('depd')('egg-logger');


/**
 * Base class for all sub Logger class.
 * It extends Map, and can contains multi {@link Transport}
 *
 * @example
 * ```js
 * const logger = new Logger();
 * logger.set('file', new FileTransport({
 *   file: '/path/to/log',
 *   level: 'INFO',
 * }));
 * logger.set('console', new ConsoleTransport({
 *   level: 'INFO',
 * }));
 * logger.info('foo');
 * ```
 */
class Logger extends Map {

  /**
   * @constructor
   * @param {Object} options - assign with `defaults` propery
   */
  constructor(options) {
    super();
    this.options = utils.assign(this.defaults, options);
    this.transports = {};
    this.name = this.constructor.name;
    this.redirectLoggers = new Map();
    this.duplicateLoggers = new Map();
  }

  /**
   * disable a transport
   * @param {String} name - transport name
   */
  disable(name) {
    const transport = this.get(name);
    if (transport) transport.disable();
  }

  /**
   * enable a transport
   * @param {String} name - transport name
   */
  enable(name) {
    const transport = this.get(name);
    if (transport) transport.enable();
  }

  /**
   * Send log to all transports.
   * It's proxy to {@link Transport}'s log method.
   * @param {String} level - log level
   * @param {Array} args - log arguments
   * @param {Object} meta - log meta
   */
  log(level, args, meta) {
    let excludes;
    let { logger, options } = this.duplicateLoggers.get(level) || {};
    if (logger) {
      excludes = options.excludes;
      logger.log(level, args, meta);
    } else {
      logger = this.redirectLoggers.get(level);
      if (logger) {
        logger.log(level, args, meta);
        return;
      }
    }

    for (const [ key, transport ] of this.entries()) {
      if (transport.shouldLog(level) && !(excludes && excludes.includes(key))) {
        transport.log(level, args, meta);
      }
    }
  }

  /**
   * write raw log to all transports
   * @param {String} msg - log message
   */
  write(msg) {
    // support util.format
    if (arguments.length > 1) msg = util.format.apply(util, arguments);
    // `NONE` is the top level
    this.log('NONE', [ msg ], { raw: true });
  }

  /**
   * Redirect specify level log to the other logger
   * @param {String} level - log level
   * @param {Logger} logger - target logger instance
   */
  redirect(level, logger) {
    level = level.toUpperCase();
    if (!this.redirectLoggers.has(level) && logger instanceof Logger) {
      this.redirectLoggers.set(level, logger);
    }
  }

  /**
   * Un-redirect specify level log
   * @param {String} level - log level
   */
  unredirect(level) {
    level = level.toUpperCase();
    this.redirectLoggers.delete(level);
  }

  /**
   * Duplicate specify level log to the other logger
   * @param {String} level - log level
   * @param {Logger} logger - target logger instance
   * @param {Object} [options] - { excludes: [] }
   */
  duplicate(level, logger, options = {}) {
    level = level.toUpperCase();
    if (!this.duplicateLoggers.has(level) && logger instanceof Logger) {
      this.duplicateLoggers.set(level, { logger, options });
    }
  }

  /**
   * Un-duplicate specify level log
   * @param {String} level - log level
   */
  unduplicate(level) {
    level = level.toUpperCase();
    this.duplicateLoggers.delete(level);
  }

  /**
   * Reload all transports
   */
  reload() {
    for (const transport of this.values()) {
      transport.reload();
    }
  }

  /**
   * End all transports
   */
  close() {
    for (const transport of this.values()) {
      transport.close();
    }
  }

  /**
   * @deprecated
   */
  end() {
    depd('logger.end() is deprecated, use logger.close()');
    this.close();
  }

}

[ 'error', 'warn', 'info', 'debug' ].forEach(level => {
  const LEVEL = level.toUpperCase();
  Logger.prototype[level] = function() {
    this.log(LEVEL, arguments);
  };
});

module.exports = Logger;
