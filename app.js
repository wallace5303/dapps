/**
 *  全局定义
 * @param app
 */
'use strict';
global.CODE = require('./app/const/statusCode');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const utils = require('./app/utils/utils');

class AppBootHook {
  constructor(app) {
    this.app = app;

    global.OS_PLATFORM = process.platform;
    global.IS_WIN = /^win/.test(process.platform);
    global.DOCKER_COMPOE_FILE = '';
    if (global.IS_WIN) {
      global.DOCKER_COMPOE_FILE = 'docker-compose-win.yml';
    } else {
      global.DOCKER_COMPOE_FILE = 'docker-compose.yml';
    }
  }

  configWillLoad() {
    // Ready to call configDidLoad,
    // Config, plugin files are referred,
    // this is the last chance to modify the config.
  }

  configDidLoad() {
    // Config, plugin files have been loaded.
  }

  async didLoad() {
    // All files have loaded, start plugin here.
  }

  async willReady() {
    // All plugins have started, can do some thing before app ready
  }

  async didReady() {
    // Worker is ready, can do some things
    // don't need to block the app boot.

    // 数据库
    const file = this.app.baseDir + '/storage/db.json';
    // utils.chmodPath(file);
    const adapter = new FileSync(file);
    const db = low(adapter);
    if (!db.has('kv').value()) {
      db.set('kv', {}).write();
    }
    if (!db.has('my_app').value()) {
      db.set('my_app', []).write();
    }
    if (!db.has('dapps').value()) {
      db.set('dapps', { version: '1.0.0' }).write();
    }
  }

  async serverDidReady() {
    // Server is listening.
  }

  async beforeClose() {
    // Do some thing before app close.
  }
}

module.exports = AppBootHook;
