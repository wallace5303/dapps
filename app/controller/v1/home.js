'use strict';

const BaseController = require('../base');
const _ = require('lodash');
const moment = require('moment');
const download = require('download');
const commonConfig = require('../../config/commonConfig');
const utils = require('../../utils/utils');

class HomeController extends BaseController {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  /*
   * out api
   */
  async outApi() {
    const self = this;
    const { app, ctx, service } = this;
    const body = ctx.request.body;
    console.log('body:%j', body);
    const data = await service.outapi.api(body);

    self.sendData(data);
  }

  /*
   * 系统信息
   */
  async sysInfo() {
    const { app, ctx, service } = this;

    const data = {
      date: moment().format('X'),
    };

    this.sendSuccess(data, 'ok');
  }

  /*
   * api - system 更新
   */
  async sysUpdate() {
    const self = this;
    const { app, ctx, service } = this;
    const query = ctx.query;

    // dapps info
    const params = {
      out_url: 'dappsInfo',
      method: 'GET',
      data: {},
    };

    const dappsInfoRes = await service.outapi.api(params);
    // console.log(dappsInfoRes);
    if (dappsInfoRes.code !== CODE.SUCCESS) {
      self.sendFail({}, '数据错误', dappsInfoRes.code);
      return;
    }

    // 本地与线上版本
    const onlineVersion = dappsInfoRes.data.version;
    const localDappsInfo = await service.lowdb.getDapps();
    console.log(localDappsInfo);
    const localVersion = localDappsInfo.version;
    console.log(
      'localVersion:%j, onlineVersion:%j',
      localVersion,
      onlineVersion
    );
    const compareRes = utils.compareVersion(localVersion, onlineVersion);
    console.log('compareRes:%j', compareRes);

    if (!compareRes) {
      self.sendFail({}, '没有新版本', CODE.DAPPS_NO_NEW_VERSION);
      return;
    }

    // 更新为线上版本
    // await service.lowdb.updateDapps(onlineVersion);

    let url = commonConfig.dappsPath.github;
    if (app.config.env === 'prod') {
      url = commonConfig.dappsPath.gitee;
    }
    const dest = this.app.baseDir;
    const cmd = download(url, dest, { extract: true, strip: 1 });
    cmd.stdout = process.stdout;
    console.log(cmd.stdout);
    this.app.logger.info('[HomeController] [sysUpdate]  dapps 下载完成');
    this.app.logger.info('[HomeController] [sysUpdate]  dapps 重启中...');
    process.send({
      to: 'master',
      action: 'reload-worker',
    });

    const data = {};
    self.sendSuccess(data, '正在更新中，请稍后刷新...');
  }
}

module.exports = HomeController;
