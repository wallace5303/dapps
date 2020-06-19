'use strict';

const BaseController = require('../base');
const _ = require('lodash');
const moment = require('moment');

class DevController extends BaseController {
  /*
   * html - 开发者
   */
  async index() {
    const { app, ctx, service } = this;
    const query = ctx.query;
    const page = Number(query.page) > 1 ? Number(query.page) : 1;

    let data = null;
    data = await service.dev.appList(page);

    data.navigation = 'dev_index';

    await ctx.render('store/devapp.ejs', data);
  }

  /*
   * api - dev 创建App
   */
  async appCreate() {
    const self = this;
    const { app, ctx, service } = this;
    const body = ctx.request.body;
    const appid = body.appid;
    const app_name = body.app_name;
    const app_image = body.app_image;
    const app_introduction = body.app_introduction;
    const app_version = body.app_version;
    const app_port = body.app_port;
    const host_port = body.host_port;
    const uid = body.uid;
    const username = body.username;
    const app_image_port = body.app_image_port;
    if (
      !appid ||
      !app_name ||
      !app_image ||
      !app_introduction ||
      !app_version ||
      !host_port
    ) {
      self.sendFail({}, '参数错误', CODE.SYS_PARAMS_ERROR);
      return;
    }
    const params = {
      appid,
      app_name,
      app_image,
      app_introduction,
      app_version,
      app_port,
      host_port,
      uid,
      username,
      app_image_port,
    };
    console.log(params);

    const createRes = await service.dev.createApp(params);
    if (createRes.code !== CODE.SUCCESS) {
      self.sendFail({}, createRes.msg, createRes.code);
      return;
    }

    const data = {};
    self.sendSuccess(data, '创建成功');
  }

  /*
   * api - dev APP启动
   */
  async appStart() {
    const self = this;
    const { app, ctx, service } = this;
    const body = ctx.request.body;
    const appid = body.appid;
    if (!appid) {
      self.sendFail({}, '参数错误', CODE.SYS_PARAMS_ERROR);
      return;
    }

    const startRes = await service.dev.startApp(appid);
    if (startRes.code !== CODE.SUCCESS) {
      self.sendFail({}, startRes.msg, startRes.code);
      return;
    }

    const data = {};
    self.sendSuccess(data, '启动成功');
  }

  /*
   * api - dev APP停止
   */
  async appStop() {
    const self = this;
    const { app, ctx, service } = this;
    const body = ctx.request.body;
    const appid = body.appid;
    if (!appid) {
      self.sendFail({}, '参数错误', CODE.SYS_PARAMS_ERROR);
      return;
    }

    const stopRes = await service.dev.stopApp(appid);
    if (stopRes.code !== CODE.SUCCESS) {
      self.sendFail({}, stopRes.msg, stopRes.code);
      return;
    }

    const data = {};
    self.sendSuccess(data, '应用已停止');
  }

  /*
   * api - dev APP卸载
   */
  async appUninstall() {
    const self = this;
    const { app, ctx, service } = this;
    const body = ctx.request.body;
    const appid = body.appid;

    const delRes = await service.dev.uninstallApp(appid);
    if (delRes.code !== CODE.SUCCESS) {
      self.sendFail({}, delRes.msg, CODE.SYS_OPERATION_FAILED);
      return;
    }

    const data = {};
    self.sendSuccess(data, '卸载成功');
  }
}

module.exports = DevController;
