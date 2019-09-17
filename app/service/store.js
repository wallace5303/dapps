'use strict';

const BaseService = require('./base');
const _ = require('lodash');
const moment = require('moment');
const utils = require('../utils/utils');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const updateAddons = require('../../script/commands/update-addons');

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
  async myAppList(page) {
    const appList = [];
    const root = process.cwd();
    const addonsDir = path.resolve(root, 'docker/addons');
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
    const root = process.cwd();
    const addonsDir = path.resolve(root, 'docker/addons');
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
    const root = process.cwd();
    const dirpath = path.resolve(root, 'docker/addons/' + appid);
    const isDir = fs.existsSync(dirpath);
    if (isDir) {
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
    // console.log(runningInfo);
    if (runningInfo.code === 0) {
      return true;
    }
    return false;
  }

  /*
   * 应用是否有更新
   */
  async appHasNewVersion(appid) {
    const root = process.cwd();
    const envFile = path.resolve(root, 'docker/addons/' + appid + '/.env');
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
  async installApp(app, query) {
    updateAddons.run(app, query);
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
    const killRes = await this.service.store.killApp(appid);
    if (!killRes) {
      res.msg = '停止容器失败';
      return res;
    }

    const delRes = await this.service.store.delApp(appid);
    if (!delRes) {
      res.msg = '删除容器失败';
      return res;
    }

    const delFileRes = await this.service.store.delAppFile(appid);
    if (!delFileRes) {
      res.msg = '删除应用文件失败';
      return res;
    }

    res.code = CODE.SUCCESS;
    res.msg = '删除成功';
    return res;
  }

  /*
   * kill应用
   */
  async killApp(appid) {
    const killRes = shell.exec('docker kill dapps_' + appid, {
      silent: true,
    });
    console.log('killRes:', killRes);
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
    console.log('delRes:', delRes);
    if (delRes.code === 0) {
      return true;
    }
    return false;
  }

  /*
   * 删除应用文件
   */
  async delAppFile(appid) {
    const root = process.cwd();
    const dirpath = path.resolve(root, 'docker/addons/' + appid);
    const isDir = fs.existsSync(dirpath);
    if (isDir) {
      const delRes = shell.rm('-rf', isDir);
      console.log('delRes:', delRes);
      if (delRes.code === 0) {
        return true;
      }
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

    const root = process.cwd();
    const dirpath = path.resolve(root, 'docker/addons/' + appid);
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

    const root = process.cwd();
    const dirpath = path.resolve(root, 'docker/addons/' + appid);
    shell.cd(dirpath);
    const stopRes = shell.exec(
      'docker-compose -f ' + DOCKER_COMPOE_FILE + ' stop ' + appid,
      {
        silent: false,
      }
    );
    this.app.logger.info('[StoreService] [stopApp] start stopRes:', stopRes);

    if (stopRes.code === 0) {
      res.msg = '停止成功';
      res.code = CODE.SUCCESS;
      return res;
    }
    return res;
  }
}

module.exports = StoreService;
