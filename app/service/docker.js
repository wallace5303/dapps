'use strict';

const BaseService = require('./base');
const shell = require('shelljs');

class DockerService extends BaseService {
  /*
   * docker检查
   */
  async checkDocker() {
    const res = {
      code: 70003,
      msg: 'unknown error',
    };

    if (!shell.which('docker')) {
      res.msg = '请先安装或启动docker软件';
      return res;
    }

    if (!shell.which('docker-compose')) {
      res.msg = '请先安装或启动docker-compose软件';
      return res;
    }
    res.code = 0;

    return res;
  }

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

  /*
   * 应用是否启动
   */
  async appIsRunning(appid) {
    const runningInfo = shell.exec('docker top dapps-' + appid, {
      silent: true,
    });
    // this.app.logger.info(
    //   '[DockerService] [appIsRunning] appid:, runningInfo:',
    //   appid,
    //   runningInfo
    // );
    if (runningInfo.code === 0) {
      return true;
    }
    return false;
  }

  /*
   * 容器是否存在
   */
  async appContainerExist(appid) {
    const containerInfo = shell.exec('docker inspect dapps-' + appid, {
      silent: true,
    });
    if (containerInfo.code === 0) {
      return true;
    }
    return false;
  }

  /*
   * 网络是否存在
   */
  async appNetworkExist(appid) {
    const networkInfo = shell.exec(
      'docker network inspect ' + appid + '_default',
      {
        silent: true,
      }
    );
    if (networkInfo.code === 0) {
      return true;
    }
    return false;
  }

  /*
   * kill应用
   */
  async killApp(appid) {
    const killRes = shell.exec('docker kill dapps-' + appid, {
      silent: true,
    });
    this.app.logger.info(
      '[DockerService] [killApp] appid:, killRes:',
      appid,
      killRes
    );
    if (killRes.code === 0) {
      return true;
    }
    return false;
  }

  /*
   * 删除应用
   */
  async delApp(appid) {
    const delRes = shell.exec('docker rm dapps-' + appid, {
      silent: true,
    });
    this.app.logger.info(
      '[DockerService] [delApp] appid:, delRes:',
      appid,
      delRes
    );
    if (delRes.code === 0) {
      return true;
    }
    return false;
  }

  /*
   * 删除网络
   */
  async delAppNetwork(appid) {
    const delRes = shell.exec('docker network rm ' + appid + '_default', {
      silent: true,
    });
    this.app.logger.info(
      '[DockerService] [delAppNetwork] appid:, delRes:',
      appid,
      delRes
    );
    if (delRes.code === 0) {
      return true;
    }
    return false;
  }

  /*
   * ps
   */
  async ps(appid, prefix = true) {
    const psRes = shell.exec(
      'docker ps -a --format "{{.Names}}" --filter name=dapps-' + appid,
      {
        silent: true,
      }
    );
    // console.log(psRes);
    if (psRes.code === 0) {
      if (psRes.stdout) {
        let appids = psRes.stdout.split('\n');
        // console.log(appids);
        appids.pop();

        // 不加前缀 dapps-
        if (!prefix) {
          appids = appids.map(function(item) {
            return item.substring(6);
          });
        }
        return appids;
      }
    }
    return false;
  }
}

module.exports = DockerService;
