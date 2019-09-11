'use strict';

const BaseService = require('./base');
const _ = require('lodash');
const moment = require('moment');
const utils = require('../utils/utils');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');

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
    const runningInfo = shell.exec('docker inspect dapps_' + appid, {
      silent: true,
    });
    if (runningInfo.stdout !== '[]\n') {
      return true;
    }
    return false;
  }

  /*
   * 应用是否有更新
   */
  async appHasNewVersion(appid, preVersion) {
    const root = process.cwd();
    const envFile = path.resolve(root, 'docker/addons/redis/.env');
    const fileArr = await utils.readFileToArr(envFile);
    for (let i = 0; i < fileArr.length; i++) {
      const tmpEle = fileArr[i];
      if (tmpEle.indexOf('APP_VERSION') !== -1) {
        console.log(tmpEle.substr(12));
        const localVersion = tmpEle.substr(12);
        if (localVersion !== preVersion) {
          return true;
        }
      }
    }
    return false;
  }
}

module.exports = StoreService;
