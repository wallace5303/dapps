'use strict';

const BaseService = require('./base');
const KeyvLib = require('keyv');
const keyvKey = require('../const/keyvKey');

this.instance = null;

class KeyvService extends BaseService {
  instance() {
    if (!KeyvService.instance) {
      const instance = new KeyvLib();
      KeyvService.instance = instance;
    }
    return KeyvService.instance;
  }

  /*
   * 保存线上dappsinfo
   */
  async setOnlineDappsinfo(data) {
    const key = keyvKey.KEYV_ONLINE_DAPPS_INFO;
    const res = await this.instance().set(
      key,
      JSON.stringify(data),
      keyvKey.EXPIRES_TIME_86400000
    );
    return res;
  }

  /*
   * 获取线上dappsinfo
   */
  async getOnlineDappsinfo() {
    const key = keyvKey.KEYV_ONLINE_DAPPS_INFO;
    let info = await this.instance().get(key);
    if (info) {
      info = JSON.parse(info);
    }
    return info;
  }
}

module.exports = KeyvService;
