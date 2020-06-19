'use strict';

const path = require('path');
const moment = require('moment');
const fs = require('mz/fs');
const debug = require('debug')('egg-logrotator:day_rotator');
const Rotator = require('./rotator');
const utils = require('../../utils');


// rotate log by day
// rename from foo.log to foo.log.YYYY-MM-DD
class DayRotator extends Rotator {

  constructor(options) {
    super(options);
    this.filesRotateBySize = this.app.config.logrotator.filesRotateBySize || [];
    this.filesRotateByHour = this.app.config.logrotator.filesRotateByHour || [];
  }

  async getRotateFiles() {
    const files = new Map();
    const logDir = this.app.config.logger.dir;
    const loggers = this.app.loggers;
    const loggerFiles = utils.walkLoggerFile(loggers);
    loggerFiles.forEach(file => {
      // support relative path
      if (!path.isAbsolute(file)) file = path.join(logDir, file);
      this._setFile(file, files);
    });

    // Should rotate agent log, because schedule is running under app worker,
    // agent log is the only differece between app worker and agent worker.
    // - app worker -> egg-web.log
    // - agent worker -> egg-agent.log
    const agentLogName = this.app.config.logger.agentLogName;
    this._setFile(path.join(logDir, agentLogName), files);

    // rotateLogDirs is deprecated
    const rotateLogDirs = this.app.config.logger.rotateLogDirs;
    if (rotateLogDirs && rotateLogDirs.length > 0) {
      this.app.deprecate('[egg-logrotator] Do not use app.config.logger.rotateLogDirs, only rotate core loggers and custom loggers');

      for (const dir of rotateLogDirs) {
        const exists = await fs.exists(dir);
        if (!exists) continue;

        try {
          const names = await fs.readdir(dir);
          for (const name of names) {
            if (!name.endsWith('.log')) {
              continue;
            }
            this._setFile(path.join(dir, name), files);
          }
        } catch (err) {
          this.logger.error(err);
        }
      }
    }

    return files;
  }

  _setFile(srcPath, files) {
    // don't rotate logPath in filesRotateBySize
    if (this.filesRotateBySize.indexOf(srcPath) > -1) {
      return;
    }

    // don't rotate logPath in filesRotateByHour
    if (this.filesRotateByHour.indexOf(srcPath) > -1) {
      return;
    }

    if (!files.has(srcPath)) {
      // allow 2 minutes deviation
      const targetPath = srcPath + moment()
        .subtract(23, 'hours')
        .subtract(58, 'minutes')
        .format('.YYYY-MM-DD');
      debug('set file %s => %s', srcPath, targetPath);
      files.set(srcPath, { srcPath, targetPath });
    }
  }
}

module.exports = DayRotator;
