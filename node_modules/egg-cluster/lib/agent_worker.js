'use strict';

/**
 * agent worker is child_process forked by master.
 *
 * agent worker only exit in two cases:
 *  - receive signal SIGTERM, exit code 0 (exit gracefully)
 *  - receive disconnect event, exit code 110 (maybe master exit in accident)
 */

// $ node agent_worker.js options
const options = JSON.parse(process.argv[2]);
if (options.require) {
  // inject
  options.require.forEach(mod => {
    require(mod);
  });
}

const debug = require('debug')('egg-cluster');
const gracefulExit = require('graceful-process');

const ConsoleLogger = require('egg-logger').EggConsoleLogger;
const consoleLogger = new ConsoleLogger({ level: process.env.EGG_AGENT_WORKER_LOGGER_LEVEL });

const Agent = require(options.framework).Agent;
debug('new Agent with options %j', options);
const agent = new Agent(options);

function startErrorHandler(err) {
  consoleLogger.error(err);
  consoleLogger.error('[agent_worker] start error, exiting with code:1');
  process.exitCode = 1;
  process.kill(process.pid);
}

agent.ready(err => {
  // don't send started message to master when start error
  if (err) return;

  agent.removeListener('error', startErrorHandler);
  process.send({ action: 'agent-start', to: 'master' });
});

// exit if agent start error
agent.once('error', startErrorHandler);

gracefulExit({
  logger: consoleLogger,
  label: 'agent_worker',
  beforeExit: () => agent.close(),
});
