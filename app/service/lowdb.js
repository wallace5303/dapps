'use strict';

const BaseService = require('./base');
const _ = require('lodash');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const FileAsync = require('lowdb/adapters/FileAsync');
const LowdbKey = require('./../const/lowdbKey');
const shortid = require('shortid');
const fs = require('fs');

class LowdbService extends BaseService {
  /*
   * fileSyncInstance
   */
  fileSyncInstance(file = null) {
    if (!file) {
      file = this.app.baseDir + '/storage/db.json';
    }
    const isDir = fs.existsSync(file);
    if (!isDir) {
      return null;
    }

    const adapter = new FileSync(file);
    const db = low(adapter);

    return db;
  }

  /*
   * set安装APP的临时数据
   */
  async setMyInstallingApp(appid) {
    const key = LowdbKey.KV_APP_INSTALLING + appid;
    const res = this.fileSyncInstance()
      .set(key, 1)
      .write();

    return res;
  }

  /*
   * get安装APP的临时数据
   */
  async getMyInstallingApp(appid) {
    const key = LowdbKey.KV_APP_INSTALLING + appid;
    const res = this.fileSyncInstance()
      .get(key)
      .value();

    return res;
  }

  /*
   * del安装APP的临时数据
   */
  async delMyInstallingApp(appid) {
    const key = LowdbKey.KV_APP_INSTALLING + appid;
    const res = this.fileSyncInstance()
      .unset(key)
      .write();

    return res;
  }

  /*
   * set安装APP的临时标识
   */
  async setInstallingAppFlag() {
    const key = LowdbKey.KV_APP_INSTALLING_FLAG;
    const res = this.fileSyncInstance()
      .set(key, 1)
      .write();

    return res;
  }

  /*
   * get安装APP的临时标识
   */
  async getInstallingAppFlag() {
    const key = LowdbKey.KV_APP_INSTALLING_FLAG;
    const res = this.fileSyncInstance()
      .get(key)
      .value();

    return res;
  }

  /*
   * del安装APP的临时标识
   */
  async delInstallingAppFlag() {
    const key = LowdbKey.KV_APP_INSTALLING_FLAG;
    const res = this.fileSyncInstance()
      .unset(key)
      .write();

    return res;
  }

  /*
   * set更新APP的临时标识
   */
  async setUpdatingAppFlag() {
    const key = LowdbKey.KV_APP_UPDATING_FLAG;
    const res = this.fileSyncInstance()
      .set(key, 1)
      .write();

    return res;
  }

  /*
   * get更新APP的临时标识
   */
  async getUpdatingAppFlag() {
    const key = LowdbKey.KV_APP_UPDATING_FLAG;
    const res = this.fileSyncInstance()
      .get(key)
      .value();

    return res;
  }

  /*
   * del更新APP的临时标识
   */
  async delUpdatingAppFlag() {
    const key = LowdbKey.KV_APP_UPDATING_FLAG;
    const res = this.fileSyncInstance()
      .unset(key)
      .write();

    return res;
  }

  /*
   * 添加my app
   */
  async createMyapp(appid) {
    const num = await this.service.lowdb.getMyappNum();
    const id = num + 1;
    const appInfo = {
      id,
      appid,
      sort: 0,
    };
    const res = this.fileSyncInstance()
      .get('my_app')
      .push(appInfo)
      .write();

    return res;
  }

  /*
   * 移除my app
   */
  async removeMyapp(appid) {
    const res = this.fileSyncInstance()
      .get('my_app')
      .remove({ appid })
      .write();

    return res;
  }

  /*
   * 获取my app
   */
  async getMyapp() {
    const list = this.fileSyncInstance()
      .get('my_app')
      .value();

    return list;
  }

  /*
   * 获取my app
   */
  async getMyappList(page = 1) {
    page = page > 1 ? page : 1;
    let list = [];
    const all = this.fileSyncInstance()
      .get('my_app')
      .value();
    if (all.length > 0) {
      const listPage = _.chunk(all, 10);
      const listInfo = listPage[page - 1];
      list = _.map(listInfo, 'appid');
    }

    return list;
  }

  /*
   * 获取my app 个数
   */
  async getMyappNum() {
    const num = this.fileSyncInstance()
      .get('my_app')
      .size()
      .value();

    return num;
  }

  /*
   * 获取 app
   */
  async getMyappByAppid(appid) {
    const info = this.fileSyncInstance()
      .get('my_app')
      .find({ appid })
      .value();
    if (info) {
      return info;
    }
    return null;
  }

  /*
   * 更新 dapps
   */
  async updateDapps(version = '') {
    const file = this.app.baseDir + '/app/common/dapps.json';
    let key = '';
    let value = '';
    if (version) {
      key = 'dapps.version';
      value = version;
    }
    const res = this.fileSyncInstance(file)
      .set(key, value)
      .write();

    return res;
  }

  /*
   * 获取dapps
   */
  async getDapps() {
    const file = this.app.baseDir + '/app/common/dapps.json';
    const info = this.fileSyncInstance(file)
      .get('dapps')
      .value();

    return info;
  }

  /*
   * 添加app update
   */
  async createAppUpate(appInfo) {
    const res = this.fileSyncInstance()
      .get('app_update')
      .push(appInfo)
      .write();

    return res;
  }

  /*
   * 移除app update
   */
  async removeAppUpdate(appid) {
    const res = this.fileSyncInstance()
      .get('app_update')
      .remove({ appid })
      .write();

    return res;
  }

  /*
   * 获取app update
   */
  async getAppUpdateList() {
    const list = this.fileSyncInstance()
      .get('app_update')
      .value();

    return list;
  }

  /*
   * 获取 app update
   */
  async getAppUpdateByAppid(appid) {
    const info = this.fileSyncInstance()
      .get('app_update')
      .find({ appid })
      .value();
    if (info) {
      return info;
    }
    return null;
  }

  /*
   * 获取app update 个数
   */
  async getAppUpdateNum() {
    const num = this.fileSyncInstance()
      .get('app_update')
      .size()
      .value();

    return num;
  }

  /*
   * get user
   */
  async getAdminUser(username, pwd) {
    const file = this.app.baseDir + '/storage/admin.json';
    const info = this.fileSyncInstance(file)
      .get('user')
      .find({ username: username, pwd: pwd })
      .value();

    return info;
  }

  /*
   * 添加admin user
   */
  async addAdminUser(username, pwd) {
    const file = this.app.baseDir + '/storage/admin.json';
    const userInfo = {
      username,
      pwd,
    };
    const res = this.fileSyncInstance(file)
      .get('user')
      .push(userInfo)
      .write();

    return res;
  }

  /*
   * 修改密码
   */
  async modifyPwd(username, newPwd) {
    const file = this.app.baseDir + '/storage/admin.json';
    const res = this.fileSyncInstance(file)
      .get('user')
      .find({ username: username })
      .assign({ pwd: newPwd})
      .write();

    return res;
  }
}

module.exports = LowdbService;
