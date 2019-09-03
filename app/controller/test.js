'use strict';

const BaseController = require('./base');
const _ = require('lodash');
const utils = require('../utils/utils');
const moment = require('moment');

class TestController extends BaseController {
  async index() {
    const { app, ctx, service } = this;
    const query = ctx.request.query;
    console.log('env:%j', app.config.env);
    const res = 0;
    const data = {
      env: app.config.env,
    };



    console.log('res:%j', res);
    this.sendSuccess(data, 'ok');
  }
}

module.exports = TestController;
