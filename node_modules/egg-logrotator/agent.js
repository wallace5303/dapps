'use strict';

module.exports = agent => {
  // reload logger to new fd after rotating
  agent.messenger.on('log-reload', () => {
    agent.loggers.reload('got log-reload message');
    agent.coreLogger.info('[egg-logrotator] agent logger reload: got log-reload message');
  });
};
