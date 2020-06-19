'use strict';

const moment = require('moment');
const fs = require('mz/fs');
const path = require('path');
const debug = require('debug')('egg-logrotator:hour_rotator');
const Rotator = require('./rotator');


// rotate log by hour
// rename from foo.log to foo.log.YYYY-MM-DD-HH
class DayRotator extends Rotator {

  async getRotateFiles() {
    const files = new Map();
    const logDir = this.app.config.logger.dir;
    const filesRotateByHour = this.app.config.logrotator.filesRotateByHour || [];

    for (let logPath of filesRotateByHour) {
      // support relative path
      if (!path.isAbsolute(logPath)) logPath = path.join(logDir, logPath);
      const exists = await fs.exists(logPath);
      if (!exists) {
        continue;
      }
      this._setFile(logPath, files);
    }

    return files;
  }

  get hourDelimiter() {
    return this.app.config.logrotator.hourDelimiter;
  }

  _setFile(srcPath, files) {
    if (!files.has(srcPath)) {
      const targetPath = srcPath + moment().subtract(1, 'hours').format(`.YYYY-MM-DD${this.hourDelimiter}HH`);
      debug('set file %s => %s', srcPath, targetPath);
      files.set(srcPath, { srcPath, targetPath });
    }
  }
}

module.exports = DayRotator;
