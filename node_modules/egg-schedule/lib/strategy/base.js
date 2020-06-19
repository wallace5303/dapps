'use strict';

module.exports = class BaseStrategy {
  constructor(schedule, agent, key) {
    this.agent = agent;
    this.key = key;
    this.schedule = schedule;
    this.logger = this.agent.getLogger('scheduleLogger');
    this.count = 0;
  }

  start() {}

  onJobStart() {}

  onJobFinish() {}

  /**
   * trigger one worker
   *
   * @param {...any} args - pass to job task
   */
  sendOne(...args) {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) {
      this.logger.warn(`${this.key} skip due to schedule closed`);
      return;
    }

    this.count++;

    const info = {
      key: this.key,
      id: this.getSeqId(),
      args,
    };

    this.logger.debug(`[Job#${info.id}] ${info.key} triggered, send random by agent`);
    this.agent.messenger.sendRandom('egg-schedule', info);
    this.onJobStart(info);
  }

  /**
   * trigger all worker
   *
   * @param {...any} args - pass to job task
   */
  sendAll(...args) {
    /* istanbul ignore next */
    if (this.agent.schedule.closed) {
      this.logger.warn(`${this.key} skip due to schedule closed`);
      return;
    }

    this.count++;

    const info = {
      key: this.key,
      id: this.getSeqId(),
      args,
    };
    this.logger.debug(`[Job#${info.id}] ${info.key} triggered, send all by agent`);
    this.agent.messenger.send('egg-schedule', info);
    this.onJobStart(info);
  }

  getSeqId() {
    return `${Date.now()}${process.hrtime().join('')}${this.count}`;
  }
};
