'use strict';

const BaseController = require('../base');

class InitializeController extends BaseController {
  /*
   * 初始化数据
   * @params: string uid
   * @return: object { token }
   */
  async index() {
    const self = this;
    const { app, ctx, service } = this;
    const userInfo = ctx.userInfo;

    const data = {
      today_first_login: 0,
      is_new_user: 0,
    };
    self.sendSuccess(data, 'ok');
  }
}

module.exports = InitializeController;
