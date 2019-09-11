'use strict';

const BaseController = require('../base');
const updateAddons = require('../../../script/commands/update-addons');

class StoreController extends BaseController {
  /*
   * html - 应用列表
   * @params: string uid
   * @return: object { token }
   */
  async index() {
    const self = this;
    const { app, ctx, service } = this;
    const query = ctx.query;
    const params = {
      out_url: 'appList',
      method: 'GET',
      data: query,
    };
    console.log('params:%j', params);
    const data = await service.outapi.api(params);

    if (data.code === CODE.SUCCESS) {
      // 列表数据
      data.app_list = data.data.list.data;
      // 所有数据
      data.all_data = data.data.list;
    }

    await ctx.render('store/index.ejs', data);
  }

  /*
   * html - 已安装
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

  /*
   * api - APP安装
   * @params: string uid
   * @return: object { token }
   */
  async install() {
    const self = this;
    const { app, ctx, service } = this;
    const appid = 'redis';
    const params = {
      appid: 'redis',
    };

    updateAddons.run(app, params);

    const data = {};
    self.sendSuccess(data, '正在安装中，请稍后刷新...');
  }
}

module.exports = StoreController;
