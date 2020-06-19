'use strict';

const HourRotator = require('../lib/hour_rotator');


module.exports = app => {
  const rotator = new HourRotator({ app });

  return {

    schedule: {
      type: 'worker', // only one worker run this task
      cron: '0 * * * *', // run every hour at 00
      disable: (app.config.logrotator.filesRotateByHour || []).length === 0,
    },

    async task() {
      await rotator.rotate();
    },

  };
};
