'use strict';

const Transport = require('./transport');
const utils = require('../utils');
const levels = require('../level');


/**
 * output log to console {@link Transport}。
 * specifical level by EGG_LOG has the highest priority
 */
class ConsoleTransport extends Transport {

  /**
   * @constructor
   * @param {Object} options
   * - {Array} [stderrLevel = ERROR] - output to stderr level, must higher than options.level
   */
  constructor(options) {
    super(options);
    this.options.stderrLevel = utils.normalizeLevel(this.options.stderrLevel);
    // EGG_LOG has the highest priority
    if (process.env.EGG_LOG) {
      this.options.level = utils.normalizeLevel(process.env.EGG_LOG);
    }
  }

  get defaults() {
    return utils.assign(super.defaults, {
      stderrLevel: 'ERROR',
    });
  }

  /**
   * output log, see {@link Transport#log}
   * if stderrLevel presents, will output log to stderr
   * @param  {String} level - log level, in upper case
   * @param  {Array} args - all arguments
   * @param  {Object} meta - meta infomations
   */
  log(level, args, meta) {
    const msg = super.log(level, args, meta);
    if (levels[level] >= this.options.stderrLevel && levels[level] < levels['NONE']) {
      process.stderr.write(msg);
    } else {
      process.stdout.write(msg);
    }
  }

}

module.exports = ConsoleTransport;
