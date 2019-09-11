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
