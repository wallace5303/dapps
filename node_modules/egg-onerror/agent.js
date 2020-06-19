'use strict';

module.exports = agent => {
  // should watch error event
  agent.on('error', err => {
    agent.coreLogger.error(err);
  });
};
