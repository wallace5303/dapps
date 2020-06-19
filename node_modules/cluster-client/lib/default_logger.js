'use strict';

const { Logger, ConsoleTransport } = require('egg-logger');
const { consoleFormatter } = require('egg-logger/lib/utils');
const logger = new Logger();
logger.set('console', new ConsoleTransport({
  level: 'INFO',
  formatter: consoleFormatter,
}));

module.exports = logger;
