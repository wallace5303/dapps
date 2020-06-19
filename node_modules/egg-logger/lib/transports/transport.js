'use strict';

const os = require('os');
const utils = require('../utils');
const levels = require('../level');

const ENABLED = Symbol('Transport#enabled');

/**
 * Transport is an output channel of the log that can be output to a file, console or service.

 * A {@link Logger} can configure multiple Transports to meet a variety of complex needs
 */
class Transport {

  /**
   * @constructor
   * @param  {Object} options
   * - {String} [level = NONE] - log level. ouput method must higher than this option. if level is `info`, `debug` will disabled
   * - {Function} formatter - format function
   * - {Function} contextFormatter - format function for context logger
   * - {Boolean} [json = false] - log format is json or not
   * - {String} [encoding = utf8] - log encodeing, see {@link https://github.com/ashtuchkin/iconv-lite#supported-encodings}
   * - {String} [eol = os.EOL] - end of line
   */
  constructor(options) {
    this.options = utils.assign(this.defaults, options);
    if (this.options.encoding === 'utf-8') {
      this.options.encoding = 'utf8';
    }
    this.options.level = utils.normalizeLevel(this.options.level);
    this[ENABLED] = true;
  }

  get defaults() {
    return {
      level: 'NONE',
      formatter: null,
      contextFormatter: null,
      json: false,
      encoding: 'utf8',
      eol: os.EOL,
    };
  }

  /**
   * enable or not
   * @return {[type]} [description]
   */
  get enabled() {
    return this[ENABLED];
  }

  /**
   * enable transport
   */
  enable() {
    this[ENABLED] = true;
  }

  /**
   * disable transport
   */
  disable() {
    this[ENABLED] = false;
  }

  set level(level) {
    this.options.level = utils.normalizeLevel(level);
  }

  get level() {
    return this.options.level;
  }

  /**
   * should  output log or not
   * @param  {String} level log level, must in upper case
   * @return {Boolean} should or not
   */
  shouldLog(level) {
    if (!this[ENABLED]) {
      return false;
    }

    if (this.options.level === levels['NONE']) {
      return false;
    }

    return this.options.level <= levels[level];
  }

  /**
   * Transport log method
   * @param  {String} level - log level
   * @param  {Array} args - all methods
   * @param  {Object} meta - meta infomations
   * @return {Buffer|String} log message
   *   - empty string means no log
   *   - utf8 encoding return String
   *   - other encoding return Buffer
   */
  log(level, args, meta) {
    return utils.format(level, args, meta, this.options);
  }

  /**
   * reload Transport
   */
  reload() {}

  /**
   * close Transport
   */
  close() {}
  end() {}
}

module.exports = Transport;
