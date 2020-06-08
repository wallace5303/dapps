'use strict';

const BaseController = require('../base');
const _ = require('lodash');

class AdminUserController extends BaseController {

  /*
   * login
   */
  async login() {
    const self = this;
    const { app, ctx, service } = this;
    const body = ctx.request.body;
    const email = body.email;
    const pwd = body.pwd;

    if (!email || !pwd) {
      self.sendFail({}, '参数错误', CODE.SYS_PARAMS_ERROR);
      return;
    }
  
    const res = await service.lowdb.getAdminUser(email, pwd);
    if (!res) {
      self.sendFail({}, '账号或密码错误', CODE.SYS_PARAMS_ERROR);
      return;
    }

    var accessToken = service.user.createAccessToken(email);

    const data = {
      "token": accessToken,
      "user_info" : {
          "uid" : email,
          "username" : email,
      }
    };
    this.sendSuccess(data, 'ok');
  }

  /*
   * add user
   */
  async addUser() {
    const self = this;
    const { app, ctx, service } = this;
    const body = ctx.request.body;
    const email = body.email;
    const pwd = body.pwd;

    if (!email || !pwd) {
      self.sendFail({}, '参数错误', CODE.SYS_PARAMS_ERROR);
      return;
    }
  
    await service.lowdb.addAdminUser(email, pwd);

    this.sendSuccess([], 'ok');
  }
}

module.exports = AdminUserController;
