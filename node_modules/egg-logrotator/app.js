'use strict';

module.exports = app => {
  // reload logger to new fd after rotating
  app.messenger.on('log-reload', () => {
    app.loggers.reload('got log-reload message');
    app.coreLogger.info('[egg-logrotator] app logger reload: got log-reload message');
  });
};
