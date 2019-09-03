'use strict';

const BaseController = require('../base');

class InitializeController extends BaseController {
  /*
   * 应用列表
   * @params: string uid
   * @return: object { token }
   */
  async index() {
    const self = this;
    const { app, ctx, service } = this;

    const dockerAddonsDir = app.baseDir + '/docker/addons';

    const data = {
      today_first_login: 0,
      is_new_user: 0,
    };
    await ctx.render('store/index.ejs', data);
  }

  /*
   * 已安装
   * @params: string uid
   * @return: object { token }
   */
  async installed() {
    const self = this;
    const { app, ctx, service } = this;

    const data = {
      today_first_login: 0,
      is_new_user: 0,
    };
    await ctx.render('store/installed.ejs', data);
  }
}

module.exports = InitializeController;
