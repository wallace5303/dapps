'use strict';

const Strategy = require('../../lib/strategy/base');
const TimerStrategy = require('../../lib/strategy/timer');
const Schedule = require('../../lib/schedule');

const SCHEDULE = Symbol('agent#schedule');

module.exports = {
  /**
   * @member agent#ScheduleStrategy
   */
  ScheduleStrategy: Strategy,

  /**
   * @member agent#TimerScheduleStrategy
   */
  TimerScheduleStrategy: TimerStrategy,

  /**
   * @member agent#schedule
   */
  get schedule() {
    if (!this[SCHEDULE]) {
      this[SCHEDULE] = new Schedule(this);
      this.beforeClose(() => {
        return this[SCHEDULE].close();
      });
    }
    return this[SCHEDULE];
  },
};
