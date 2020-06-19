'use strict';

const assert = require('assert');
const debug = require('debug')('egg:logger');
const utils = require('../utils');
const Logger = require('./logger');
const ErrorLogger = require('./error_logger');
const CustomLogger = require('./custom_logger');


const defaults = {
  env: 'default',
  type: '',
  dir: '',
  encoding: 'utf8',
  level: 'INFO',
  consoleLevel: 'NONE',
  outputJSON: false,
  buffer: true,
  appLogName: '',
  coreLogName: '',
  agentLogName: '',
  errorLogName: '',
  concentrateError: 'duplicate',
};

/**
 * Logger Manager, accord config to create multi loggers.
 */

class Loggers extends Map {

  /**
   * @constructor
   * @param  {Object} config - egg app config
   * - logger
   *   - {String} env - egg app runtime env string, detail please see `app.config.env`
   *   - {String} type - current process type, `application` or `agent`
   *   - {String} dir - log file dir
   *   - {String} [encoding = utf8] - log string encoding
   *   - {String} [level = INFO] - file log level
   *   - {String} [consoleLevel = NONE] - console log level
   *   - {Boolean} [outputJSON = false] - send JSON log or not
   *   - {Boolean} [buffer = true] - use {@link FileBufferTransport} or not
   *   - {String} appLogName - egg app file logger name
   *   - {String} coreLogName - egg core file logger name
   *   - {String} agentLogName - egg agent file logger name
   *   - {String} errorLogName - err common error logger name
   *   - {String} eol - end of line char
   *   - {String} [concentrateError = duplicate] - whether write error logger to common-error.log, `duplicate` / `redirect` / `ignore`
   * - customLogger
   */
  constructor(config) {
    super();

    const loggerConfig = utils.assign({}, defaults, config.logger);
    const customLoggerConfig = config.customLogger;

    debug('Init loggers with options %j', loggerConfig);
    assert(loggerConfig.type, 'should pass config.logger.type');
    assert(loggerConfig.dir, 'should pass config.logger.dir');
    assert(loggerConfig.appLogName, 'should pass config.logger.appLogName');
    assert(loggerConfig.coreLogName, 'should pass config.logger.coreLogName');
    assert(loggerConfig.agentLogName, 'should pass config.logger.agentLogName');
    assert(loggerConfig.errorLogName, 'should pass config.logger.errorLogName');

    const errorLogger = new ErrorLogger(utils.assign({}, loggerConfig, {
      file: loggerConfig.errorLogName,
    }));
    this.set('errorLogger', errorLogger);

    if (loggerConfig.type === 'agent') {
      const logger = new Logger(utils.assign({}, loggerConfig, {
        file: loggerConfig.agentLogName,
      }));
      this.set('logger', logger);

      const coreLogger = new Logger(utils.assign({}, loggerConfig, loggerConfig.coreLogger, {
        file: loggerConfig.agentLogName,
      }));
      this.set('coreLogger', coreLogger);
    } else {
      const logger = new Logger(utils.assign({}, loggerConfig, {
        file: loggerConfig.appLogName,
      }));
      this.set('logger', logger);

      const coreLogger = new Logger(utils.assign({}, loggerConfig, loggerConfig.coreLogger, {
        file: loggerConfig.coreLogName,
      }));
      this.set('coreLogger', coreLogger);
    }

    for (const name in customLoggerConfig) {
      const logger = new CustomLogger(utils.assign({}, loggerConfig, customLoggerConfig[name]));
      this.set(name, logger);
    }
  }

  /**
   * Disable console logger
   */
  disableConsole() {
    for (const logger of this.values()) {
      logger.disable('console');
    }
  }

  reload() {
    for (const logger of this.values()) {
      logger.reload();
    }
  }

  /**
   * Add a logger
   * @param {String} name - logger name
   * @param {Logger} logger - Logger instance
   */
  set(name, logger) {
    if (this.has(name)) {
      return;
    }

    // redirect ERROR log to errorLogger, except errorLogger itself
    if (name !== 'errorLogger') {
      switch (logger.options.concentrateError) {
        case 'duplicate':
          logger.duplicate('error', this.errorLogger, { excludes: [ 'console' ] });
          break;
        case 'redirect':
          logger.redirect('error', this.errorLogger);
          break;
        case 'ignore':
          break;
        default:
          break;
      }
    }
    this[name] = logger;
    super.set(name, logger);
  }

}

module.exports = Loggers;
