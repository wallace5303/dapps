'use strict';

const BaseService = require('./base');
const _ = require('lodash');
const utils = require('../utils/utils');
const fs = require('fs');
const shell = require('shelljs');
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
        open_url: '',
        host_port: '',
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
          if (tmpEle.indexOf('HOST_PORT') !== -1) {
            tmpAppObj.host_port = tmpEle.substr(10);
          }
        }
      }
      appList.push(tmpAppObj);
    }

    return appList;
  }

  /*
   * 应用升级列表
   */
  async myAppUpdateList() {
    const appList = [];
    const addonsDir = this.app.baseDir + '/docker/addons';

    // 获取我的APP列表
    const appUpdateList = await this.service.lowdb.getAppUpdateList();

    for (let i = 0; i < appUpdateList.length; i++) {
      const tmpAppInfo = appUpdateList[i];
      const tmpAppid = tmpAppInfo.appid;
      const tmpAppObj = {
        appid: tmpAppid,
        app_name: '',
        update_content: '',
      };
      const envFile = addonsDir + '/' + tmpAppid + '/.env';
      if (fs.existsSync(envFile)) {
        const fileArr = await utils.readFileToArr(envFile);
        for (let i = 0; i < fileArr.length; i++) {
          const tmpEle = fileArr[i];
          if (tmpEle.indexOf('APP_NAME') !== -1) {
            tmpAppObj.app_name = tmpEle.substr(9);
          }
          if (tmpEle.indexOf('APP_UPDATE_CONTENT') !== -1) {
            tmpAppObj.update_content = tmpEle.substr(19);
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
   * 我的web应用
   */
  async myWebAppList() {
    const webAppList = [];
    const addonsDir = this.app.baseDir + '/docker/addons';

    // 获取我的APP列表
    const lsDir = await this.service.lowdb.getMyapp();
    // console.log(lsDir);
    for (let i = 0; i < lsDir.length; i++) {
      const tmpAppInfo = lsDir[i];
      const tmpAppid = tmpAppInfo.appid;

      // 检查应用是否启动
      const runRes = await this.service.docker.appIsRunning(tmpAppid);
      if (!runRes) {
        continue;
      }

      const tmpAppObj = {
        appid: tmpAppid,
        app_name: '',
        open_url: '',
      };
      const envFile = addonsDir + '/' + tmpAppid + '/.env';
      if (fs.existsSync(envFile)) {
        const fileArr = await utils.readFileToArr(envFile);
        for (let i = 0; i < fileArr.length; i++) {
          const tmpEle = fileArr[i];
          if (tmpEle.indexOf('APP_NAME') !== -1) {
            tmpAppObj.app_name = tmpEle.substr(9);
          }
          if (tmpEle.indexOf('APP_PORT') !== -1) {
            const appPort = tmpEle.substr(9);
            if (appPort) {
              tmpAppObj.open_url =
                'http://' + utils.getIPAddress() + ':' + appPort;
              webAppList.push(tmpAppObj);
            }
          }
        }
      }
    }

    return webAppList;
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
    const nodeVersion = shell.exec('node -v', { silent: true }).substr(1);

    if (!utils.compareVersion('8.0', nodeVersion)) {
      this.app.logger.error(
        '[StoreService] [installApp] node 需要 8.0 或以上版本'
      );
      return false;
    }

    const appid = query.appid;
    const appPath = this.app.baseDir + '/docker/addons/' + appid;
    this.app.logger.info(
      '[StoreService] [installApp]  开始下载平台文件压缩包...'
    );
    let downloadType = 'github';
    if (this.app.config.env === 'prod') {
      downloadType = 'coding';
    }
    await tools.wget(appPath, appid, downloadType);

    // 检查是否下载成功
    const appIsExist = await this.service.store.appIsInstall(appid);
    if (!appIsExist) {
      this.app.logger.error('[StoreService] [installApp]  下载失败');
      return false;
    }

    this.app.logger.info('[StoreService] [installApp]  下载完成');

    // 写入正在安装的临时数据
    await this.service.lowdb.setInstallingAppFlag();
    await this.service.lowdb.setMyInstallingApp(appid);

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
    await this.service.lowdb.delInstallingAppFlag();
    await this.service.lowdb.delMyInstallingApp(appid);

    // my app
    await this.service.lowdb.createMyapp(appid);

    return true;
  }

  // /*
  //  * 卸载应用(包括依赖的应用)
  //  */
  // async uninstallApps(appid) {
  //   const res = {
  //     code: CODE.SUCCESS,
  //     msg: '卸载成功',
  //   };
  //   const appids = await this.service.docker.ps(appid, false);
  //   if (!appids || _.isEmpty(appids)) {
  //     res.msg = '应用不存在-apps';
  //     res.code = 1000;
  //     return res;
  //   }
  //   // 因为有依赖，翻转数组
  //   appids.reverse();
  //   console.log(appids);
  //   for (let i = 0; i < appids.length; i++) {
  //     const one = appids[i];
  //     const delRes = await this.uninstallApp(one);
  //     // console.log('one:%j stopRes:%j', one, stopRes);
  //     if (delRes.code !== CODE.SUCCESS) {
  //       res.msg = delRes.msg;
  //       res.code = 1000;
  //     }
  //   }
  //   return res;
  // }

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
      const stopRes = await this.stopApp(appid);
      if (stopRes.code !== CODE.SUCCESS) {
        return stopRes;
      }
    }
    const dirpath = this.app.baseDir + '/docker/addons/' + appid;
    const rmRes = await this.service.dockerCompose.rm(dirpath);
    if (rmRes.code !== CODE.SUCCESS) {
      return rmRes;
    }

    const removeRes = await this.service.lowdb.removeMyapp(appid);
    if (removeRes.length == 0) {
      res.msg = appid + '删除失败(文件)';
      return res;
    }

    // 检查网络是否存在
    const networkIsExist = await this.service.docker.appNetworkExist(appid);
    if (networkIsExist) {
      const delNetworkRes = await this.service.docker.delAppNetwork(appid);
      if (!delNetworkRes) {
        res.msg = appid + '删除容器网络失败';
        return res;
      }
    }

    res.code = CODE.SUCCESS;
    res.msg = appid + '删除成功';
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
      downloadType = 'coding';
    }
    await tools.wget(appPath, appid, downloadType);

    this.app.logger.info('[StoreService] [updateApp]  下载完成');

    // 写入正在更新的临时数据
    await this.service.lowdb.setUpdatingAppFlag();

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

    await this.service.lowdb.delUpdatingAppFlag();
    await this.service.lowdb.removeAppUpdate(appid);

    return true;
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
      msg: 'unknown error，请查看日志./dapps/logs/dapps/dapps-web.log',
    };

    const appIsExist = await this.service.store.appIsInstall(appid);
    if (!appIsExist) {
      res.msg = '应用不存在';
      return res;
    }

    const isRunning = await this.service.docker.appIsRunning(appid);
    if (isRunning) {
      res.msg = '应用正在运行';
      return res;
    }

    const checkPort = await this.appPortCheck(appid);
    // console.log(checkPort);
    if (checkPort.occupied) {
      res.msg = '端口' + checkPort.port + '已被占用，请关闭占用端口的服务';
      return res;
    }
    const dirpath = this.app.baseDir + '/docker/addons/' + appid;
    const startRes = await this.service.dockerCompose.start(dirpath);
    return startRes;
  }

  /*
   * 端口是否被占用
   */
  async appPortCheck(appid) {
    const res = {
      occupied: false,
      port: null,
    };
    const addonsDir = this.app.baseDir + '/docker/addons';
    const envFile = addonsDir + '/' + appid + '/.env';
    if (fs.existsSync(envFile)) {
      const fileArr = await utils.readFileToArr(envFile);
      for (let i = 0; i < fileArr.length; i++) {
        const tmpEle = fileArr[i];
        let appPort = null;
        if (tmpEle.indexOf('APP_PORT') !== -1) {
          appPort = tmpEle.substr(9);
          if (appPort) {
            res.port = appPort;
            res.occupied = await utils.portIsOccupied(appPort);
            return res;
          }
        }
        if (tmpEle.indexOf('HOST_PORT') !== -1) {
          appPort = tmpEle.substr(10);
          if (appPort) {
            res.port = appPort;
            res.occupied = await utils.portIsOccupied(appPort);
            return res;
          }
        }
      }
    }

    return res;
  }

  /*
   * stop应用(包括依赖的应用)
   */
  // async stopApps(appid) {
  //   const res = {
  //     code: CODE.SUCCESS,
  //     msg: '停止成功',
  //   };
  //   const appids = await this.service.docker.ps(appid, false);
  //   // console.log(appids);
  //   if (!appids || _.isEmpty(appids)) {
  //     res.msg = '应用不存在-apps';
  //     res.code = 1000;
  //     return res;
  //   }
  //   // 因为有依赖，翻转数组
  //   appids.reverse();
  //   console.log(appids);
  //   for (let i = 0; i < appids.length; i++) {
  //     const one = appids[i];
  //     const stopRes = await this.stopApp(one);
  //     // console.log('one:%j stopRes:%j', one, stopRes);
  //     if (stopRes.code !== CODE.SUCCESS) {
  //       res.msg = stopRes.msg;
  //       res.code = 1000;
  //     }
  //   }
  //   return res;
  // }

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
      res.msg = appid + '应用不存在';
      return res;
    }

    const isRunning = await this.service.docker.appIsRunning(appid);
    if (!isRunning) {
      res.msg = appid + '应用没有在运行';
      return res;
    }
    const dirpath = this.app.baseDir + '/docker/addons/' + appid;
    const stopRes = await this.service.dockerCompose.stop(dirpath);
    return stopRes;
  }

  /*
   * dapps 信息
   */
  async getDappsInfo() {
    let info = await this.service.keyv.getOnlineDappsinfo();
    // this.app.logger.info('info1:', info);
    if (info) {
      return info;
    }

    const params = {
      out_url: 'dappsInfo',
      method: 'GET',
      data: {},
    };

    const dappsInfoRes = await this.service.outapi.api(params);
    if (dappsInfoRes.code !== CODE.SUCCESS) {
      info = await this.service.lowdb.getDapps();
    } else {
      info = dappsInfoRes.data;
    }
    
    // this.app.logger.info('info2:', info);
    await this.service.keyv.setOnlineDappsinfo(info);

    return info;
  }
}

module.exports = StoreService;
