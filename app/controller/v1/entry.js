'use strict';

const BaseController = require('../base');
const _ = require('lodash');
const validateRules = require('../../utils/validataRules');
const utilsIndex = require('../../utils/index');
const commonConfig = require('../../config/commonConfig');
const msgConfig = require('../../config/msgConfig');

class LoginController extends BaseController {
  /*
   * 注册html
   */
  async registerHtml() {
    const { ctx } = this;

    const data = {};
    await ctx.render('store/register.ejs', data);
  }

  /*
   * 登录html
   */
  async loginHtml() {
    const { ctx } = this;

    const data = {};
    await ctx.render('store/login.ejs', data);
  }

  /*
   * 注册
   */
  async register() {
    const self = this;
    const { app, ctx, service } = this;

    const { username, email, pwd1, pwd2 } = ctx.request.body;
    const data = await service.user.register(username, email, pwd1, pwd2);

    self.sendData(data);
  }

  /*
   * 登录 todo
   */
  async login() {}
}

module.exports = LoginController;
