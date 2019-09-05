'use strict';

const BaseController = require('./base');
const _ = require('lodash');
const utils = require('../utils/utils');
const moment = require('moment');
const shell = require('shelljs');

class TestController extends BaseController {
  async index() {
    const { app, ctx, service } = this;
    const query = ctx.request.query;
    console.log('env:%j', app.config.env);
    const res = 0;
    const data = {
      env: app.config.env,
    };
    // JSON.parse();
    console.log(this.app.config.baseDir);

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
