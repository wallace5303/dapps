'use strict';

const Strategy = require('./base');
const parser = require('cron-parser');
const ms = require('humanize-ms');
const safetimers = require('safe-timers');
const assert = require('assert');
const utility = require('utility');
const is = require('is-type-of');
const CRON_INSTANCE = Symbol('cron_instance');

module.exports = class TimerStrategy extends Strategy {
  constructor(...args) {
    super(...args);

    const { interval, cron, cronOptions, immediate } = this.schedule;
    assert(interval || cron || immediate, `[egg-schedule] ${this.key} schedule.interval or schedule.cron or schedule.immediate must be present`);
    assert(is.function(this.handler), `[egg-schedule] ${this.key} strategy should override \`handler()\` method`);

    // init cron parser
    if (cron) {
      try {
        this[CRON_INSTANCE] = parser.parseExpression(cron, cronOptions);
      } catch (err) {
        err.message = `[egg-schedule] ${this.key} parse cron instruction(${cron}) error: ${err.message}`;
        throw err;
      }
    }
  }

  start() {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) return;

    if (this.schedule.immediate) {
      this.logger.info(`[Timer] ${this.key} next time will execute immediate`);
      setImmediate(() => this.handler());
    } else {
      this._scheduleNext();
    }
  }

  _scheduleNext() {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) return;

    // get next tick
    const nextTick = this.getNextTick();

    if (nextTick) {
      this.logger.info(`[Timer] ${this.key} next time will execute after ${nextTick}ms at ${utility.logDate(new Date(Date.now() + nextTick))}`);
      this.safeTimeout(() => this.handler(), nextTick);
    } else {
      this.logger.info(`[Timer] ${this.key} reach endDate, will stop`);
    }
  }

  onJobStart() {
    // Next execution will trigger task at a fix rate, regardless of its execution time.
    this._scheduleNext();
  }

  /**
   * calculate next tick
   *
   * @return {Number} time interval, if out of range then return `undefined`
   */
  getNextTick() {
    // interval-style
    if (this.schedule.interval) return ms(this.schedule.interval);

    // cron-style
    if (this[CRON_INSTANCE]) {
      // calculate next cron tick
      const now = Date.now();
      let nextTick;
      let nextInterval;

      // loop to find next feature time
      do {
        try {
          nextInterval = this[CRON_INSTANCE].next();
          nextTick = nextInterval.getTime();
        } catch (err) {
          // Error: Out of the timespan range
          return;
        }
      } while (now >= nextTick);

      return nextTick - now;
    }
  }

  safeTimeout(handler, delay, ...args) {
    const fn = delay < safetimers.maxInterval ? setTimeout : safetimers.setTimeout;
    return fn(handler, delay, ...args);
  }
};
