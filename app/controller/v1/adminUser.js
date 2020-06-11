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
    const username = body.username;
    const pwd = body.pwd;

    if (!username || !pwd) {
      self.sendFail({}, '参数错误', CODE.SYS_PARAMS_ERROR);
      return;
    }
  
    const res = await service.lowdb.getAdminUser(username, pwd);
    if (!res) {
      self.sendFail({}, '账号或密码错误', CODE.SYS_PARAMS_ERROR);
      return;
    }

    var accessToken = service.user.createAccessToken(username);

    const data = {
      "token": accessToken,
      "user_info" : {
          "username" : username,
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
    const newUser = body.new_user;
    const username = body.username;
    const pwd = body.pwd;

    if (!newUser || !username || !pwd) {
      self.sendFail({}, '参数错误', CODE.SYS_PARAMS_ERROR);
      return;
    }
    if (username !== "admin") {
      self.sendFail({}, '无权限添加', CODE.SYS_PARAMS_ERROR);
      return;
    }
  
    await service.lowdb.addAdminUser(newUser, pwd);

    this.sendSuccess([], 'ok');
  }

  /*
   * 修改密码
   */
  async modifyPwd() {
    const self = this;
    const { app, ctx, service } = this;
    const body = ctx.request.body;
    const username = body.username;
    const beforePwd = body.before_pwd;
    const newPwd = body.new_pwd;
    const confirmPwd = body.confirm_pwd;

    if (!username || !beforePwd || !newPwd || !confirmPwd) {
      self.sendFail({}, '参数错误', CODE.SYS_PARAMS_ERROR);
      return;
    }
    if (newPwd !== confirmPwd) {
      self.sendFail({}, '新密码不一致', CODE.SYS_PARAMS_ERROR);
      return;
    }

    const res = await service.lowdb.getAdminUser(username, beforePwd);
    if (!res) {
      self.sendFail({}, '原密码错误', CODE.SYS_PARAMS_ERROR);
      return;
    }

    let upRes = await service.lowdb.modifyPwd(username, newPwd);
    console.log('upRes', upRes);

    this.sendSuccess([], 'ok');
  }
}

module.exports = AdminUserController;
