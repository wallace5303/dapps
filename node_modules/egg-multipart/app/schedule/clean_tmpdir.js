'use strict';

const path = require('path');
const fs = require('mz/fs');
const rimraf = require('mz-modules/rimraf');
const moment = require('moment');

module.exports = app => {
  return class CleanTmpdir extends (app.Subscription || app.BaseContextClass) {
    static get schedule() {
      return {
        type: 'worker',
        cron: app.config.multipart.cleanSchedule.cron,
        immediate: false,
      };
    }

    async _remove(dir) {
      const { ctx } = this;
      if (await fs.exists(dir)) {
        ctx.coreLogger.info('[egg-multipart:CleanTmpdir] removing tmpdir: %j', dir);
        try {
          await rimraf(dir);
          ctx.coreLogger.info('[egg-multipart:CleanTmpdir:success] tmpdir: %j has been removed', dir);
        } catch (err) {
          ctx.coreLogger.error('[egg-multipart:CleanTmpdir:error] remove tmpdir: %j error: %s',
            dir, err);
          ctx.coreLogger.error(err);
        }
      }
    }

    async subscribe() {
      const { ctx } = this;
      const config = ctx.app.config;
      ctx.coreLogger.info('[egg-multipart:CleanTmpdir] start clean tmpdir: %j', config.multipart.tmpdir);
      // last year
      const lastYear = moment().subtract(1, 'years');
      const lastYearDir = path.join(config.multipart.tmpdir, lastYear.format('YYYY'));
      await this._remove(lastYearDir);
      // 3 months
      for (let i = 1; i <= 3; i++) {
        const date = moment().subtract(i, 'months');
        const dir = path.join(config.multipart.tmpdir, date.format('YYYY/MM'));
        await this._remove(dir);
      }
      // 7 days
      for (let i = 1; i <= 7; i++) {
        const date = moment().subtract(i, 'days');
        const dir = path.join(config.multipart.tmpdir, date.format('YYYY/MM/DD'));
        await this._remove(dir);
      }
      ctx.coreLogger.info('[egg-multipart:CleanTmpdir] end');
    }
  };
};
