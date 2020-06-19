'use strict';

const STRATEGY = Symbol('strategy');
const STRATEGY_INSTANCE = Symbol('strategy_instance');
const loadSchedule = require('./load_schedule');

module.exports = class Schedule {
  constructor(agent) {
    this.agent = agent;
    this.logger = agent.getLogger('scheduleLogger');
    this[STRATEGY] = new Map();
    this[STRATEGY_INSTANCE] = new Map();
    this.closed = false;
  }

  /**
   * register a custom Schedule Strategy
   * @param {String} type - strategy type
   * @param {Strategy} clz - Strategy class
   */
  use(type, clz) {
    this[STRATEGY].set(type, clz);
  }

  /**
   * load all schedule jobs, then initialize and register speical strategy
   */
  init() {
    const scheduleItems = loadSchedule(this.agent);

    for (const k of Object.keys(scheduleItems)) {
      const { key, schedule } = scheduleItems[k];
      const type = schedule.type;
      if (schedule.disable) continue;

      // find speical Strategy
      const Strategy = this[STRATEGY].get(type);
      if (!Strategy) {
        const err = new Error(`schedule type [${type}] is not defined`);
        err.name = 'EggScheduleError';
        throw err;
      }

      // Initialize strategy and register
      const instance = new Strategy(schedule, this.agent, key);
      this[STRATEGY_INSTANCE].set(key, instance);
    }
  }

  /**
   * job finish event handler
   *
   * @param {Object} info - { key, success, message }
   */
  onJobFinish(info) {
    this.logger.debug(`[Job#${info.id}] ${info.key} finish event received by agent from worker#${info.workerId}`);

    const instance = this[STRATEGY_INSTANCE].get(info.key);
    /* istanbul ignore else */
    if (instance) {
      instance.onJobFinish(info);
    }
  }

  /**
   * start schedule
   */
  start() {
    this.closed = false;
    for (const instance of this[STRATEGY_INSTANCE].values()) {
      instance.start();
    }
  }

  close() {
    this.closed = true;
  }
};
