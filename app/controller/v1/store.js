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
    const page = query.page ? Number(query.page) : 1;
    const appid = query.appid ? query.appid : null;
    const author = query.author ? query.author : null;
    const sortField = query.sort_field ? query.sort_field : 'aid';
    const sortType = query.sort_type ? query.sort_type : 'desc';
    const all = false;
    const uid = query.uid ? query.uid : null;
    // const dockerAddonsDir = app.baseDir + '/docker/addons';
    const data = {
      app_list: null,
      all_data: null,
      user_info: null,
    };
    const list = null;
    const resList = await service.store.appList(
      all,
      page,
      appid,
      author,
      sortField,
      sortType,
      uid
    );
    if (resList.code === CODE.SUCCESS) {
      // 列表数据
      data.app_list = resList.data.list.data;
      // 所有数据
      data.all_data = resList.data.list;
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
