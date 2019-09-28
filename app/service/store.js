'use strict';

const BaseService = require('./base');
const _ = require('lodash');
const moment = require('moment');
const utils = require('../utils/utils');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const updateAddons = require('../../script/commands/update-addons');
const tools = require('../utils/tools');

class StoreService extends BaseService {
  /*
   * 商店应用列表
   */
  async appList(all, page, appid, author, sortField, sortType) {
    const res = {
      code: 1000,
      msg: 'unknown error',
    };

    try {
      const params = {
        all,
        page,
        appid,
        author,
        sort_field: sortField,
        sort_type: sortType,
      };
      const url = this.app.config.outApi.appList;
      const response = await this.app.curl(url, {
        method: 'GET',
        contentType: 'application/json',
        data: params,
        dataType: 'json',
        timeout: 15000,
      });
      const result = response.data;
      // this.app.logger.info('[StoreService] [appList]: result:%j', result);
      if (result.code !== CODE.SUCCESS) {
        this.app.logger.error(
          '[StoreService] [appList]: error result:%j',
          result
        );
      }
      return result;
    } catch (e) {
      this.app.logger.error('[StoreService] [appList]: error ', e);
    }

    return res;
  }

  /*
   * 我的应用
   */
  async myAppList(page = 1) {
    const appList = [];
    const addonsDir = this.app.baseDir + '/docker/addons';
    // const lsDir = utils.getDirs(addonsDir);

    // 获取我的APP列表
    const lsDir = await this.service.lowdb.getMyappList(page);

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
        }
      }
      appList.push(tmpAppObj);
    }

    return appList;
  }

  /*
   * 我的应用总数
   */
  async myAppTotal() {
    let total = 0;
    const addonsDir = this.app.baseDir + '/docker/addons';
    const lsDir = utils.getDirs(addonsDir);
    const index = lsDir.indexOf('example');
    if (index > -1) {
      lsDir.splice(index, 1);
    }
    total = lsDir.length;

    return total;
  }

  /*
   * 我的应用总数 local
   */
  async myAppTotalLocal() {
    let total = 0;
    const addonsDir = this.app.baseDir + '/docker/addons';
    const lsDir = utils.getDirs(addonsDir);
    const index = lsDir.indexOf('example');
    if (index > -1) {
      lsDir.splice(index, 1);
    }
    total = lsDir.length;

    return total;
  }

  /*
   * 应用是否安装
   */
  async appIsInstall(appid) {
    const dirpath = this.app.baseDir + '/docker/addons/' + appid;
    const isDir = fs.existsSync(dirpath);
    if (isDir) {
      return true;
    }
    return false;
  }

  /*
   * 应用是否安装 my app
   */
  async appIsInstallForMyapp(appid) {
    const val = await this.service.lowdb.getMyappByAppid(appid);
    if (val) {
      return true;
    }
    return false;
  }

  /*
   * 应用是否正在安装中
   */
  async appIsInstalling(appid) {
    const val = await this.service.lowdb.getMyInstallingApp(appid);
    if (val) {
      return true;
    }
    return false;
  }

  /*
   * 应用是否启动
   */
  async appIsRunning(appid) {
    const runningInfo = shell.exec('docker top dapps_' + appid, {
      silent: true,
    });
    this.app.logger.info(
      '[StoreService] [appIsRunning] appid:, runningInfo:',
      appid,
      runningInfo
    );
    if (runningInfo.code === 0) {
      return true;
    }
    return false;
  }

  /*
   * 容器是否存在
   */
  async appContainerExist(appid) {
    const containerInfo = shell.exec('docker inspect dapps_' + appid, {
      silent: true,
    });
    if (containerInfo.code === 0) {
      return true;
    }
    return false;
  }

  /*
   * 应用是否有更新
   */
  async appHasNewVersion(appid) {
    const envFile = this.app.baseDir + '/docker/addons/' + appid + '/.env';
    if (fs.existsSync(envFile)) {
      const fileArr = await utils.readFileToArr(envFile);
      for (let i = 0; i < fileArr.length; i++) {
        const tmpEle = fileArr[i];
        if (tmpEle.indexOf('APP_VERSION') !== -1) {
          const localVersion = tmpEle.substr(12);

          // 查询线上版本
          const params = {
            out_url: 'appInfo',
            method: 'GET',
            data: {
              appid,
            },
          };
          const appInfoRes = await this.service.outapi.api(params);
          if (!_.isEmpty(appInfoRes.data)) {
            const onlineVersion = appInfoRes.data.version;
            // console.log(
            //   'appid:%j, localVersion: %j, onlineVersion:%j',
            //   appid,
            //   localVersion,
            //   onlineVersion
            // );
            const compareRes = utils.compareVersion(
              localVersion,
              onlineVersion
            );
            // console.log('appid:%j, compareRes:%j', appid, compareRes);
            if (compareRes) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  /*
   * 安装应用
   */
  async installApp(query) {
    // updateAddons.run(app, query);
    const nodeVersion = shell.exec('node -v', { silent: true }).substr(1);

    if (!utils.compareVersion('7.6', nodeVersion)) {
      this.app.logger.error(
        '[StoreService] [installApp] node 需要 7.6 或以上版本'
      );
      return false;
    }

    const appid = query.appid;

    // 写入正在安装的临时数据
    await this.service.lowdb.setMyInstallingApp(appid);

    const appPath = this.app.baseDir + '/docker/addons/' + appid;
    this.app.logger.info(
      '[StoreService] [installApp]  开始下载平台文件压缩包...'
    );
    let downloadType = 'github';
    if (this.app.config.env === 'prod') {
      downloadType = 'gitee';
    }
    await tools.wget(appPath, appid, downloadType);
    this.app.logger.info('[StoreService] [installApp]  下载完成');

    // 修改权限
    utils.chmodPath(appPath, '777');

    this.app.logger.info('[StoreService] [installApp] 开始docker安装...');
    shell.cd(appPath);
    if (!shell.which('docker-compose')) {
      this.app.logger.info(
        '[StoreService] [installApp] 需要配置docker-compose 环境'
      );
    }
    const dockerRes = shell.exec(
      'docker-compose  -f ' + DOCKER_COMPOE_FILE + ' up -d ' + appid,
      {
        silent: false,
      }
    );
    this.app.logger.info('[StoreService] [installApp] dockerRes:', dockerRes);
    this.app.logger.info(
      '[StoreService] [installApp]  dockerRes.code:',
      dockerRes.code
    );

    // 删除临时文件
    await this.service.lowdb.delMyInstallingApp(appid);

    // my app
    await this.service.lowdb.createMyapp(appid);

    return true;
  }

  /*
   * 卸载应用
   */
  async uninstallApp(appid) {
    const res = {
      code: 1000,
      msg: 'unknown error',
    };

    const isRunning = await this.service.store.appIsRunning(appid);
    if (isRunning) {
      const killRes = await this.service.store.killApp(appid);
      if (!killRes) {
        res.msg = '停止容器失败';
        return res;
      }
    }

    const containerIsExist = await this.service.store.appContainerExist(appid);
    if (containerIsExist) {
      const delRes = await this.service.store.delApp(appid);
      if (!delRes) {
        res.msg = '删除容器失败';
        return res;
      }
    }

    const removeRes = await this.service.lowdb.removeMyapp(appid);
    if (removeRes.length == 0) {
      res.msg = '删除失败';
      return res;
    }

    res.code = CODE.SUCCESS;
    res.msg = '删除成功';
    return res;
  }

  /*
   * 更新应用
   */
  async updateApp(appid) {
    const appPath = this.app.baseDir + '/docker/addons/' + appid;
    this.app.logger.info(
      '[StoreService] [updateApp]  开始下载平台文件压缩包...'
    );
    let downloadType = 'github';
    if (this.app.config.env === 'prod') {
      downloadType = 'gitee';
    }
    await tools.wget(appPath, appid, downloadType);
    this.app.logger.info('[StoreService] [updateApp]  下载完成');

    // 修改权限
    utils.chmodPath(appPath, '777');

    this.app.logger.info('[StoreService] [updateApp] 开始docker安装...');
    shell.cd(appPath);

    const stopRes = shell.exec(
      'docker-compose -f ' + DOCKER_COMPOE_FILE + ' stop ' + appid,
      {
        silent: false,
      }
    );
    this.app.logger.info('[StoreService] [updateApp] stop stopRes:', stopRes);

    const dockerRes = shell.exec(
      'docker-compose  -f ' + DOCKER_COMPOE_FILE + ' up -d ' + appid,
      {
        silent: false,
      }
    );
    this.app.logger.info('[StoreService] [updateApp] dockerRes:', dockerRes);
    this.app.logger.info(
      '[StoreService] [updateApp]  dockerRes.code:',
      dockerRes.code
    );

    return true;
  }

  /*
   * kill应用
   */
  async killApp(appid) {
    const killRes = shell.exec('docker kill dapps_' + appid, {
      silent: true,
    });
    this.app.logger.info(
      '[StoreService] [killApp] appid:, killRes:',
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
    const delRes = shell.exec('docker rm dapps_' + appid, {
      silent: true,
    });
    this.app.logger.info(
      '[StoreService] [delApp] appid:, delRes:',
      appid,
      delRes
    );
    if (delRes.code === 0) {
      return true;
    }
    return false;
  }

  /*
   * 删除应用文件
   */
  async delAppFile(appid) {
    const dirpath = this.app.baseDir + '/docker/addons/' + appid;
    const isDir = fs.existsSync(dirpath);
    if (isDir) {
      utils.delDir(dirpath);
      return true;
    }

    return false;
  }

  /*
   * start应用
   */
  async startApp(appid) {
    const res = {
      code: 1000,
      msg: 'unknown error',
    };

    const appIsExist = await this.service.store.appIsInstall(appid);
    if (!appIsExist) {
      res.msg = '应用不存在';
      return res;
    }

    const isRunning = await this.service.store.appIsRunning(appid);
    if (isRunning) {
      res.msg = '应用正在运行';
      return res;
    }

    const dirpath = this.app.baseDir + '/docker/addons/' + appid;
    shell.cd(dirpath);
    const startRes = shell.exec(
      'docker-compose -f ' + DOCKER_COMPOE_FILE + ' up -d ' + appid,
      {
        silent: false,
      }
    );
    this.app.logger.info('[StoreService] [startApp] start startRes:', startRes);

    if (startRes.code === 0) {
      res.msg = '启动成功';
      res.code = CODE.SUCCESS;
      return res;
    }
    return res;
  }

  /*
   * stop应用
   */
  async stopApp(appid) {
    const res = {
      code: 1000,
      msg: 'unknown error',
    };

    const appIsExist = await this.service.store.appIsInstall(appid);
    if (!appIsExist) {
      res.msg = '应用不存在';
      return res;
    }

    const isRunning = await this.service.store.appIsRunning(appid);
    if (!isRunning) {
      res.msg = '应用没有在运行';
      return res;
    }

    const dirpath = this.app.baseDir + '/docker/addons/' + appid;
    shell.cd(dirpath);
    const stopRes = shell.exec(
      'docker-compose -f ' + DOCKER_COMPOE_FILE + ' stop ' + appid,
      {
        silent: false,
      }
    );
    this.app.logger.info('[StoreService] [stopApp] stop stopRes:', stopRes);

    if (stopRes.code === 0) {
      res.msg = '停止成功';
      res.code = CODE.SUCCESS;
      return res;
    }
    return res;
  }
}

module.exports = StoreService;
