'use strict';

const BaseController = require('../base');
const _ = require('lodash');
const moment = require('moment');

class HomeController extends BaseController {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  /*
   * out api
   */
  async outApi() {
    const self = this;
    const { app, ctx, service } = this;
    const body = ctx.request.body;
    console.log('body:%j', body);
    const data = await service.outapi.api(body);

    self.sendData(data);
  }

  /*
   * 错误上报
   */
  async errorReport() {
    const { app, ctx, service } = this;
    const body = ctx.request.body;
    const uid = body.uid;
    let environment = body.environment;
    let content = body.content;
    if (_.isObject(environment)) {
      environment = JSON.stringify(environment);
    }
    if (_.isObject(content)) {
      content = JSON.stringify(content);
    }

    service.report.errorCollect(uid, environment, content);

    this.sendSuccess({}, 'ok');
  }

  /*
   * 系统信息
   */
  async sysInfo() {
    const { app, ctx, service } = this;

    const data = {
      date: moment().format('X'),
    };

    this.sendSuccess(data, 'ok');
  }
}

module.exports = HomeController;
