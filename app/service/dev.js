'use strict';

const BaseService = require('./base');
const shell = require('shelljs');
const _ = require('lodash');
const utils = require('../utils/utils');
const fs = require('fs');
const decompress = require('decompress');

class DevService extends BaseService {
  /*
   * app list
   */
  async appList(page = 1) {
    page = Number(page) > 1 ? Number(page) : 1;

    const data = {
      app_list: [],
      all_data: {
        total: 0,
        current_page: page,
        last_page: 1,
      },
    };

    const appList = await this.devAppList(page);
    // console.log(appList);

    if (!_.isEmpty(appList)) {
      // 列表数据处理
      if (!_.isEmpty(appList)) {
        for (let i = 0; i < appList.length; i++) {
          const one = appList[i];
          one.is_running = false;
          one.exist_container = false;

          // 是否启动
          const runRes = await this.service.docker.appIsRunning(one.appid);
          if (runRes) {
            one.is_running = true;
          }

          // 文档地址
          one.show = '';

          // 是否存在容器
          const containerIsExist = await this.service.docker.appContainerExist(
            one.appid
          );
          // console.log('containerIsExist', containerIsExist);
          if (containerIsExist) {
            one.exist_container = true;
          }
        }
      }
      // console.log(appList);
      data.app_list = appList;
    }

    // 总数目
    const total = await this.getDevAppNum();
    data.all_data.total = total;

    return data;
  }

  /*
   * dev app count
   */
  async getDevAppNum() {
    const addonsDir = this.app.baseDir + '/docker/dev';
    const lsDir = utils.getDirs(addonsDir);
    const index = lsDir.indexOf('example');
    if (index > -1) {
      lsDir.splice(index, 1);
    }

    return lsDir.length;
  }

  /*
   * 我的开发应用
   */
  async devAppList(page = 1) {
    const appList = [];
    const addonsDir = this.app.baseDir + '/docker/dev';
    const lsDir = utils.getDirs(addonsDir);

    const index = lsDir.indexOf('example');
    if (index > -1) {
      lsDir.splice(index, 1);
    }
    // console.log(lsDir);
    for (let i = 0; i < lsDir.length; i++) {
      const tmpAppid = lsDir[i];
      const tmpAppObj = {
        appid: tmpAppid,
        uid: '',
        author: '',
        app_name: '',
        introduction: '',
        version: '',
        open_url: '',
      };
      const envFile = addonsDir + '/' + tmpAppid + '/.env';
      if (fs.existsSync(envFile)) {
        const fileArr = await utils.readFileToArr(envFile);
        for (let i = 0; i < fileArr.length; i++) {
          const tmpEle = fileArr[i];
          if (tmpEle.indexOf('AUTHOR_UID') !== -1) {
            tmpAppObj.uid = tmpEle.substr(11);
          }
          if (tmpEle.indexOf('AUTHOR_NAME') !== -1) {
            tmpAppObj.author = tmpEle.substr(12);
          }
          if (tmpEle.indexOf('APP_NAME') !== -1) {
            tmpAppObj.app_name = tmpEle.substr(9);
          }
          if (tmpEle.indexOf('APP_INTRODUCTION') !== -1) {
            tmpAppObj.introduction = tmpEle.substr(17);
          }
          if (tmpEle.indexOf('APP_VERSION') !== -1) {
            tmpAppObj.version = tmpEle.substr(12);
          }
          if (tmpEle.indexOf('APP_PORT') !== -1) {
            const appPort = tmpEle.substr(9);
            if (appPort) {
              tmpAppObj.open_url =
                'http://' + utils.getIPAddress() + ':' + appPort;
            }
          }
        }
      }
      appList.push(tmpAppObj);
    }

    return appList;
  }

  /*
   * 端口是否被占用
   */
  async devAppPortCheck(appid) {
    const res = {
      occupied: false,
      port: null,
    };
    const addonsDir = this.app.baseDir + '/docker/dev';
    const envFile = addonsDir + '/' + appid + '/.env';
    if (fs.existsSync(envFile)) {
      const fileArr = await utils.readFileToArr(envFile);
      for (let i = 0; i < fileArr.length; i++) {
        const tmpEle = fileArr[i];
        let appPort = null;
        if (tmpEle.indexOf('APP_PORT') !== -1) {
          appPort = tmpEle.substr(9);
          res.port = appPort;
          if (appPort < 0 || appPort > 65536) {
            res.occupied = true;
            return res;
          }
          if (appPort) {
            res.occupied = await utils.portIsOccupied(appPort);
            return res;
          }
        }
        if (tmpEle.indexOf('HOST_PORT') !== -1) {
          appPort = tmpEle.substr(10);
          res.port = appPort;
          if (appPort < 0 || appPort > 65536) {
            res.occupied = true;
            return res;
          }
          if (appPort) {
            res.occupied = await utils.portIsOccupied(appPort);
            return res;
          }
        }
      }
    }

    return res;
  }

  /*
   * start应用
   */
  async startApp(appid) {
    const res = {
      code: 1000,
      msg: '启动失败，请检查docker应用相关文件',
    };

    const appIsExist = await this.appIsInstall(appid);
    if (!appIsExist) {
      res.msg = '应用不存在';
      return res;
    }

    const isRunning = await this.service.docker.appIsRunning(appid);
    if (isRunning) {
      res.msg = '应用正在运行';
      return res;
    }

    const checkPort = await this.devAppPortCheck(appid);
    if (checkPort.occupied) {
      res.msg = '端口' + checkPort.port + '已被占用，请关闭占用端口的服务';
      return res;
    }

    const dirpath = this.app.baseDir + '/docker/dev/' + appid;
    const startRes = await this.service.dockerCompose.start(dirpath);
    return startRes;
    // shell.cd(dirpath);
    // const startRes = shell.exec(
    //   'docker-compose -f ' + DOCKER_COMPOE_FILE + ' up -d ',
    //   {
    //     silent: false,
    //   }
    // );
    // this.app.logger.info('[DevService] [startApp] start startRes:', startRes);

    // if (startRes.code === 0) {
    //   res.msg = '启动成功';
    //   res.code = CODE.SUCCESS;
    //   return res;
    // }

    // res.msg = startRes.stderr;
    // return res;
  }

  /*
   * stop应用
   */
  async stopApp(appid) {
    const res = {
      code: 1000,
      msg: 'unknown error',
    };

    const appIsExist = await this.appIsInstall(appid);
    if (!appIsExist) {
      res.msg = '应用不存在';
      return res;
    }

    const isRunning = await this.service.docker.appIsRunning(appid);
    if (!isRunning) {
      res.msg = '应用没有在运行';
      return res;
    }

    const dirpath = this.app.baseDir + '/docker/dev/' + appid;
    const stopRes = await this.service.dockerCompose.stop(dirpath);
    return stopRes;
    // shell.cd(dirpath);
    // const stopRes = shell.exec(
    //   'docker-compose -f ' + DOCKER_COMPOE_FILE + ' stop ' + appid,
    //   {
    //     silent: false,
    //   }
    // );
    // this.app.logger.info('[DevService] [stopApp] stop stopRes:', stopRes);

    // if (stopRes.code === 0) {
    //   res.msg = '停止成功';
    //   res.code = CODE.SUCCESS;
    //   return res;
    // }
    // res.msg = stopRes.stderr;
    // return res;
  }

  /*
   * 卸载应用
   */
  async uninstallApp(appid) {
    const res = {
      code: 1000,
      msg: 'unknown error',
    };

    const isRunning = await this.service.docker.appIsRunning(appid);
    if (isRunning) {
      // const killRes = await this.service.docker.killApp(appid);
      // if (!killRes) {
      //   res.msg = '停止容器失败';
      //   return res;
      // }
      const stopRes = await this.stopApp(appid);
      if (stopRes.code !== CODE.SUCCESS) {
        return stopRes;
      }
    }

    const dirpath = this.app.baseDir + '/docker/dev/' + appid;
    const rmRes = await this.service.dockerCompose.rm(dirpath);
    if (rmRes.code !== CODE.SUCCESS) {
      return rmRes;
    }

    // const containerIsExist = await this.service.docker.appContainerExist(appid);
    // if (containerIsExist) {
    //   const delRes = await this.service.docker.delApp(appid);
    //   if (!delRes) {
    //     res.msg = '删除容器失败';
    //     return res;
    //   }
    // }

    // 检查网络是否存在
    const networkIsExist = await this.service.docker.appNetworkExist(appid);
    if (networkIsExist) {
      const delNetworkRes = await this.service.docker.delAppNetwork(appid);
      if (!delNetworkRes) {
        res.msg = '删除容器网络失败';
        return res;
      }
    }

    res.code = CODE.SUCCESS;
    res.msg = '删除成功';
    return res;
  }

  /*
   * 应用是否安装
   */
  async appIsInstall(appid) {
    const dirpath = this.app.baseDir + '/docker/dev/' + appid;
    const isDir = fs.existsSync(dirpath);
    if (isDir) {
      return true;
    }
    return false;
  }

  /*
   * dev app create
   */
  async createApp(params) {
    const res = {
      code: 1000,
      msg: 'unknown error',
    };
    const addonsDir = this.app.baseDir + '/docker/dev';
    const examplezip = addonsDir + '/example.zip';

    // 检查appid是否存在
    const appIsExist = await this.service.dev.appIsInstall(params.appid);
    if (appIsExist) {
      res.msg = 'appid已经存在，请更换';
      return res;
    }

    // 解压
    const dist = addonsDir + '/' + params.appid;
    await decompress(examplezip, dist, { strip: 1 });
    utils.chmodPath(dist, '777');

    // 修改文件信息
    const modifyRes = await this.service.dev.modifyFile(params);
    if (!modifyRes) {
      res.msg = '创建异常，请手动修改文件';
      return res;
    }

    res.code = CODE.SUCCESS;
    res.msg = 'ok';
    return res;
  }

  /*
   * modify file
   */
  async modifyFile(params) {
    const addonsDir = this.app.baseDir + '/docker/dev';
    const fileDir = addonsDir + '/' + params.appid;

    // .env
    shell.sed('-i', '{authoruid}', params.uid, fileDir + '/.env');
    shell.sed('-i', '{author_name}', params.username, fileDir + '/.env');
    shell.sed('-i', '{app_id}', params.appid, fileDir + '/.env');
    shell.sed('-i', '{app_name}', params.app_name, fileDir + '/.env');
    shell.sed(
      '-i',
      '{app_introduction}',
      params.app_introduction,
      fileDir + '/.env'
    );
    shell.sed('-i', '{app_version}', params.app_version, fileDir + '/.env');
    shell.sed('-i', '{app_port}', params.app_port, fileDir + '/.env');
    shell.sed('-i', '{host_port}', params.host_port, fileDir + '/.env');

    // docker-compose.yml
    shell.sed(
      '-i',
      'example-server',
      params.appid,
      fileDir + '/docker-compose.yml'
    );
    shell.sed(
      '-i',
      'example-image',
      params.app_image,
      fileDir + '/docker-compose.yml'
    );
    shell.sed(
      '-i',
      'dapps-example',
      'dapps-' + params.appid,
      fileDir + '/docker-compose.yml'
    );
    shell.sed(
      '-i',
      'app_image_port',
      params.app_image_port,
      fileDir + '/docker-compose.yml'
    );

    // docker-compose-win.yml
    shell.sed(
      '-i',
      'example-server',
      params.appid,
      fileDir + '/docker-compose-win.yml'
    );
    shell.sed(
      '-i',
      'example-image',
      params.app_image,
      fileDir + '/docker-compose-win.yml'
    );
    shell.sed(
      '-i',
      'dapps-example',
      'dapps-' + params.appid,
      fileDir + '/docker-compose-win.yml'
    );
    shell.sed(
      '-i',
      'app_image_port',
      params.app_image_port,
      fileDir + '/docker-compose-win.yml'
    );

    return true;
  }
}

module.exports = DevService;
