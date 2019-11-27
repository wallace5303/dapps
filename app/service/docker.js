'use strict';

const BaseService = require('./base');
const shell = require('shelljs');

class DockerService extends BaseService {
  /*
   * network clean
   */
  async networkClean() {
    try {
      const cleanRes = shell.exec('docker network prune -f');
      this.app.logger.info(
        '[DockerService] [networkClean] cleanRes:',
        cleanRes
      );
      if (cleanRes.code === 0) {
        return true;
      }
      return false;
    } catch (e) {
      this.app.logger.error('[DockerService] [networkClean]: error ', e);
    }

    return true;
  }
}

module.exports = DockerService;
