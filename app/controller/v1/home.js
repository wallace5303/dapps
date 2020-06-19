'use strict';

const BaseController = require('../base');
const _ = require('lodash');
const moment = require('moment');
const download = require('download');
const commonConfig = require('../../config/commonConfig');
const utils = require('../../utils/utils');
const shell = require('shelljs');

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

    // 本地版本
    const localDappsInfo = await service.lowdb.getDapps();
    const localVersion = localDappsInfo.version;

    // 获取线上dappsinfo
    const dappsInfoRes = await service.store.getDappsInfo();

    // 线上版本
    const onlineVersion = dappsInfoRes.version;
    const compareRes = utils.compareVersion(localVersion, onlineVersion);
    app.logger.info(
      '[StoreController] [checkSysVersion] dappsInfo:%j',
      {
        local: localDappsInfo,
        online: dappsInfoRes,
        compare: compareRes
      }
    );

    if (!compareRes) {
      self.sendFail({}, '没有新版本', CODE.DAPPS_NO_NEW_VERSION);
      return;
    }

    // 更新为线上版本
    // await service.lowdb.updateDapps(onlineVersion);

    const url = commonConfig.dappsPath.coding;
    app.logger.info('[HomeController] [sysUpdate]  url:%j', url);
    const dest = this.app.baseDir;
    const cmd = await download(url, dest, { extract: true, strip: 1 });
    cmd.stdout = process.stdout;
    app.logger.info(cmd.stdout);
    app.logger.info('[HomeController] [sysUpdate]  dapps 下载完成');
    app.logger.info('[HomeController] [sysUpdate]  dapps 请重启服务');

    setTimeout(function () {
      shell.cd(this.app.baseDir);
      shell.exec('npm run stop', {
        silent: false,
      });
    }, 60 * 60 * 1000);

    // process.send({
    //   to: 'master',
    //   action: 'reload-worker',
    // });

    const data = {};
    self.sendSuccess(data, '下载完成，请重启服务');
  }
}

module.exports = HomeController;
