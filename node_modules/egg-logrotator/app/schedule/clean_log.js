'use strict';

const path = require('path');
const fs = require('mz/fs');
const moment = require('moment');
const utils = require('../../utils');

// clean all xxx.log.YYYY-MM-DD beofre expried date.
module.exports = app => ({
  schedule: {
    type: 'worker', // only one worker run this task
    cron: '0 0 * * *', // run every day at 00:00
  },

  async task() {
    const logger = app.coreLogger;
    const logDirs = new Set();
    const loggerFiles = utils.walkLoggerFile(app.loggers);
    loggerFiles.forEach(file => {
      const logDir = path.dirname(file);
      logDirs.add(logDir);
    });
    const maxDays = app.config.logrotator.maxDays;
    if (maxDays && maxDays > 0) {
      try {
        const tasks = Array.from(logDirs, logdir => removeExpiredLogFiles(logdir, maxDays, logger));
        await Promise.all(tasks);
      } catch (err) {
        logger.error(err);
      }
    }

    logger.info('[egg-logrotator] clean all log before %s days', maxDays);
  },
});

// remove expired log files: xxx.log.YYYY-MM-DD
async function removeExpiredLogFiles(logdir, maxDays, logger) {
  // ignore not exists dir
  const exists = await fs.exists(logdir);
  if (!exists) return;

  const files = await fs.readdir(logdir);
  const expriedDate = moment().subtract(maxDays, 'days').startOf('date');
  const names = files.filter(file => {
    const name = path.extname(file).substring(1);
    if (!/^\d{4}\-\d{2}\-\d{2}/.test(name)) {
      return false;
    }
    const date = moment(name, 'YYYY-MM-DD').startOf('date');
    if (!date.isValid()) {
      return false;
    }
    return date.isBefore(expriedDate);
  });
  if (names.length === 0) {
    return;
  }

  logger.info(`[egg-logrotator] start remove ${logdir} files: ${names.join(', ')}`);

  await Promise.all(names.map(name => {
    const logfile = path.join(logdir, name);
    return fs.unlink(logfile)
      .catch(err => {
        err.message = `[egg-logrotator] remove logfile ${logfile} error, ${err.message}`;
        logger.error(err);
      });
  }));
}
