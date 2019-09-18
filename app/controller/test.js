'use strict';

const BaseController = require('./base');
const _ = require('lodash');
const utils = require('../utils/utils');
const moment = require('moment');
const shell = require('shelljs');
const fs = require('fs');
const path = require('path');

class TestController extends BaseController {
  async index() {
    const { app, ctx, service } = this;
    const query = ctx.request.query;
    console.log('env:%j', app.config.env);
    const res = 0;
    const root = process.cwd();
    const data = {
      env: app.config.env,
    };

    // const delFileRes = await this.service.store.delAppFile('redis');
    // if (!delFileRes) {
    //   res.msg = '删除应用文件失败';
    //   return res;
    // }

    // console.log('this.app.baseDir:%j', this.app.baseDir);

    // console.log('OS_PLATFORM ', OS_PLATFORM);
    // // const isWin = /^win/.test('win32');
    // console.log('IS_WIN ', IS_WIN);
    // console.log('DOCKER_COMPOE_FILE ', DOCKER_COMPOE_FILE);

    // const compareRes = utils.compareVersion('1.0.0', '1.10.0');
    // console.log('compareRes:%j', compareRes);
    // const file = path.resolve(root, 'docker/addons/redis/.env');
    // const arr = await utils.readFileToArr(file);
    // console.log(arr);
    // for (let i = 0; i < arr.length; i++) {
    //   const tmpEle = arr[i];
    //   if (tmpEle.indexOf('APP_VERSION') !== -1) {
    //     console.log(tmpEle.substr(12));
    //   }
    // }

    // JSON.parse();
    // console.log(this.app.config.baseDir);

    // if (!shell.which('node')) {
    //   shell.echo('Sorry, this script requires git');
    //   // shell.exit(1);
    // }

    // const nodeVersion = shell.exec('node -v', { silent: false });
    // console.log(nodeVersion);

    console.log('res:%j', res);
    this.sendSuccess(data, 'ok');
  }
}

module.exports = TestController;
