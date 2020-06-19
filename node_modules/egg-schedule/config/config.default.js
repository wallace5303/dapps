'use strict';

module.exports = () => {
  const config = {};

  config.customLogger = {
    scheduleLogger: {
      consoleLevel: 'NONE',
      file: 'egg-schedule.log',
    },
  };

  config.schedule = {
    // custom additional directory, full path
    directory: [],
  };

  return config;
};
