'use strict';

const BaseController = require('../base');
const updateAddons = require('../../../script/commands/update-addons');
const _ = require('lodash');
const utils = require('../../utils/utils');

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

    const data = {
      app_list: null,
      all_data: null,
    };

    console.log('query:%j', query);
    const params = {
      out_url: 'appList',
      method: 'GET',
      data: query,
    };
    console.log('params:%j', params);
    const appRes = await service.outapi.api(params);

    if (appRes.code === CODE.SUCCESS) {
      // 列表数据处理
      const tmpAppList = appRes.data.list.data;
      console.log('tmpAppList:%j', tmpAppList);
      if (!_.isEmpty(tmpAppList)) {
        for (let i = 0; i < tmpAppList.length; i++) {
          const one = tmpAppList[i];
          one.is_install = false;
          // one.is_running = false;
          // one.is_new_version = false;

          // 检查是否安装
          const installRes = service.store.appIsInstall(one.appid);
          if (installRes) {
            one.is_install = true;
          }

          // 是否启动
          // const runRes = service.store.appIsRunning(one.appid);
          // if (runRes) {
          //   one.is_running = true;
          // }

          // 是否有更新
          // const newVersionRes = service.store.appHasNewVersion(
          //   one.appid,
          //   one.version
          // );
          // if (newVersionRes) {
          //   one.is_new_version = true;
          // }

          // break;
        }
      }

      data.app_list = appRes.data.list.data;
      // 所有数据
      data.all_data = appRes.data.list;
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
