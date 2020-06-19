'use strict';

const SizeRotator = require('../lib/size_rotator');


module.exports = app => {
  const rotator = new SizeRotator({ app });

  return {

    schedule: {
      type: 'worker',
      interval: app.config.logrotator.rotateDuration,
      disable: (app.config.logrotator.filesRotateBySize || []).length === 0,
    },

    async task() {
      await rotator.rotate();
    },
  };
};
