'use strict';

const BaseService = require('./base');
const shell = require('shelljs');
const fs = require('fs');

class DockerComposeService extends BaseService {
  /*
   * start
   */
  async start(dirpath) {
    const res = {
      code: 1000,
      msg: 'unknown error',
    };
    const isDir = fs.existsSync(dirpath);
    if (!isDir) {
      res.msg = '应用不存在';
      return res;
    }

    shell.cd(dirpath);
    const startRes = shell.exec(
      'docker-compose -f ' + DOCKER_COMPOE_FILE + ' up -d',
      {
        silent: false,
      }
    );
    this.app.logger.info(
      '[DockerComposeService] [start] start startRes:',
      startRes
    );

    if (startRes.code === 0) {
      res.msg = '启动成功';
      res.code = CODE.SUCCESS;
      return res;
    }

    res.msg = startRes.stderr;
    return res;
  }

  /*
   * stop
   */
  async stop(dirpath) {
    const res = {
      code: 1000,
      msg: 'unknown error',
    };
    const isDir = fs.existsSync(dirpath);
    if (!isDir) {
      res.msg = '应用不存在';
      return res;
    }
    shell.cd(dirpath);
    const stopRes = shell.exec(
      'docker-compose -f ' + DOCKER_COMPOE_FILE + ' stop',
      {
        silent: false,
      }
    );
    this.app.logger.info(
      '[DockerComposeService] [stop] stop stopRes:',
      stopRes
    );

    if (stopRes.code === 0) {
      res.msg = '停止成功';
      res.code = CODE.SUCCESS;
      return res;
    }
    res.msg = stopRes.stderr;
    return res;
  }

  /*
   * rm
   */
  async rm(dirpath) {
    const res = {
      code: 1000,
      msg: 'unknown error',
    };
    const isDir = fs.existsSync(dirpath);
    if (!isDir) {
      res.msg = '应用不存在';
      return res;
    }
    shell.cd(dirpath);
    const rmRes = shell.exec(
      'docker-compose -f ' + DOCKER_COMPOE_FILE + ' rm -f',
      {
        silent: false,
      }
    );
    this.app.logger.info('[DockerComposeService] [rm] rm rmRes:', rmRes);

    if (rmRes.code === 0) {
      res.msg = '删除容器成功';
      res.code = CODE.SUCCESS;
      return res;
    }
    res.msg = rmRes.stderr;
    return res;
  }
}

module.exports = DockerComposeService;
