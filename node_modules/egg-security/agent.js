'use strict';

const utils = require('./lib/utils');

module.exports = agent => {
  utils.preprocessConfig(agent.config.security);
};
