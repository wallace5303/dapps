'use strict';

const cluster = require('cluster');
const getExitFunction = require('./exit');

const init = Symbol('graceful-process-init');

module.exports = (options = {}) => {
  const logger = options.logger || console;
  let logLevel = (options.logLevel || 'info').toLowerCase();
  if (logger !== console) {
    // don't handle custom logger level
    logLevel = 'info';
  }
  const printLogLevels = {
    info: true,
    warn: true,
    error: true,
  };
  if (logLevel === 'warn') {
    printLogLevels.info = false;
  } else if (logLevel === 'error') {
    printLogLevels.info = false;
    printLogLevels.warn = false;
  }
  const label = options.label || `graceful-process#${process.pid}`;

  if (process[init]) {
    printLogLevels.warn && logger.warn('[%s] graceful-process init already', label);
    return;
  }
  process[init] = true;

  const exit = getExitFunction(options.beforeExit, logger, label);

  // https://github.com/eggjs/egg-cluster/blob/master/lib/agent_worker.js#L35
  // exit gracefully
  process.once('SIGTERM', () => {
    printLogLevels.info && logger.info('[%s] receive signal SIGTERM, exiting with code:0', label);
    exit(0);
  });

  process.once('exit', code => {
    const level = code === 0 ? 'info' : 'error';
    printLogLevels[level] && logger[level]('[%s] exit with code:%s', label, code);
  });

  if (cluster.worker) {
    // cluster mode
    // https://github.com/nodejs/node/blob/6caf1b093ab0176b8ded68a53ab1ab72259bb1e0/lib/internal/cluster/child.js#L28
    cluster.worker.once('disconnect', () => {
      // ignore suicide disconnect event
      if (cluster.worker.exitedAfterDisconnect) return;
      logger.error('[%s] receive disconnect event in cluster fork mode, exitedAfterDisconnect:false', label);
    });
  } else {
    // child_process mode
    process.once('disconnect', () => {
      // wait a loop for SIGTERM event happen
      setImmediate(() => {
        // if disconnect event emit, maybe master exit in accident
        logger.error('[%s] receive disconnect event on child_process fork mode, exiting with code:110', label);
        exit(110);
      });
    });
  }
};
