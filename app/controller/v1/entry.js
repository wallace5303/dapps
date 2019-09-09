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

    const data = {
      // uid,
      // access_token,
    };
    self.sendSuccess(data, msgConfig.REGISTER_SUCCESS[this.lang]);
  }

  /*
   * 登录 todo
   */
  async login() {
    const self = this;
    const { app, ctx, service } = this;
    let { type, country, phone, code, email, password } = ctx.request.body;
    country = country ? country : '86';

    if (_.isEmpty(type)) {
      self.sendFail(
        {},
        msgConfig.SYS_PARAMS_ERROR[this.lang],
        CODE.SYS_PARAMS_ERROR
      );
      return;
    }

    const data = {
      uid: apiData.mid,
      access_token: apiData.access_token,
    };
    self.sendSuccess(data, msgConfig.LOGIN_SUCCESS[this.lang]);
  }
}

module.exports = LoginController;
