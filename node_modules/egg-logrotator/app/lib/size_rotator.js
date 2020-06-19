'use strict';

const fs = require('mz/fs');
const path = require('path');
const debug = require('debug')('egg-logrotator:size_rotator');
const Rotator = require('./rotator');


// rotate log by size, if the size of file over maxFileSize,
// it will rename from foo.log to foo.log.1
// if foo.log.1 exists, foo.log.1 will rename to foo.log.2
class SizeRotator extends Rotator {

  async getRotateFiles() {
    const files = new Map();
    const logDir = this.app.config.logger.dir;
    const filesRotateBySize = this.app.config.logrotator.filesRotateBySize || [];
    const maxFileSize = this.app.config.logrotator.maxFileSize;
    const maxFiles = this.app.config.logrotator.maxFiles;
    for (let logPath of filesRotateBySize) {
      // support relative path
      if (!path.isAbsolute(logPath)) logPath = path.join(logDir, logPath);

      const exists = await fs.exists(logPath);
      if (!exists) {
        continue;
      }
      try {
        const stat = await fs.stat(logPath);
        if (stat.size >= maxFileSize) {
          this.logger.info(`[egg-logrotator] file ${logPath} reach the maximum file size, current size: ${stat.size}, max size: ${maxFileSize}`);
          // delete max log file if exists, otherwise will throw when rename
          const maxFileName = `${logPath}.${maxFiles}`;
          const maxExists = await fs.exists(maxFileName);
          if (maxExists) {
            await fs.unlink(maxFileName);
          }
          this._setFile(logPath, files);
        }
      } catch (err) {
        err.message = '[egg-logrotator] ' + err.message;
        this.logger.error(err);
      }
    }
    return files;
  }

  _setFile(logPath, files) {
    const maxFiles = this.app.config.logrotator.maxFiles;
    if (files.has(logPath)) {
      return;
    }
    // foo.log.2 -> foo.log.3
    // foo.log.1 -> foo.log.2
    for (let i = maxFiles - 1; i >= 1; i--) {
      const srcPath = `${logPath}.${i}`;
      const targetPath = `${logPath}.${i + 1}`;
      debug('set file %s => %s', srcPath, targetPath);
      files.set(srcPath, { srcPath, targetPath });
    }
    // foo.log -> foo.log.1
    debug('set file %s => %s', logPath, `${logPath}.1`);
    files.set(logPath, { srcPath: logPath, targetPath: `${logPath}.1` });
  }

}

module.exports = SizeRotator;
