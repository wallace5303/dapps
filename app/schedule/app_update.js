'use strict';

const Subscription = require('egg').Subscription;
const _ = require('lodash');
const fs = require('fs');
const utils = require('../utils/utils');

/**
 * app 更新检查
 */

class AppUpate extends Subscription {
  static get schedule() {
    return {
      interval: '360m',
      type: 'worker',
      immediate: true,
      disable: false,
    };
  }

  async subscribe() {
    const { ctx, app, service } = this;
    const addonsDir = app.baseDir + '/docker/addons';

    const appList = await service.lowdb.getMyapp();
    // console.log('appList', appList);

    if (!_.isEmpty(appList)) {
      for (let i = 0; i < appList.length; i++) {
        const one = appList[i];
        one.current_version = '';
        const existApp = await service.lowdb.getAppUpdateByAppid(one.appid);
        // console.log('existApp:', existApp);
        if (existApp) {
          continue;
        }

        const envFile = addonsDir + '/' + one.appid + '/.env';
        if (fs.existsSync(envFile)) {
          const fileArr = await utils.readFileToArr(envFile);
          for (let i = 0; i < fileArr.length; i++) {
            const tmpEle = fileArr[i];
            if (tmpEle.indexOf('APP_VERSION') !== -1) {
              one.current_version = tmpEle.substr(12);
            }
          }
        }
        // console.log('one:', one);

        // 是否有更新
        const newVersionRes = await service.store.appHasNewVersion(
          one.appid,
          one.current_version
        );
        // console.log('newVersionRes:', newVersionRes);
        if (newVersionRes) {
          await service.lowdb.createAppUpate(one);
        }

        // 等待5秒
        await utils.sleep(5000);
      }
    }
  }
}

module.exports = AppUpate;
