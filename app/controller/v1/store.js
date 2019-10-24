'use strict';

const BaseController = require('../base');
const _ = require('lodash');
const utils = require('../../utils/utils');
const commonConfig = require('../../config/commonConfig');
const MarkdownIt = require('markdown-it');
const fs = require('fs');

class StoreController extends BaseController {
  /*
   * html - 快速使用
   */
  async quick() {
    const { app, ctx, service } = this;

    const data = {
      navigation: 'quick',
      app_list: [],
      all_data: {
        total: 0,
      },
    };

    const appList = await service.store.myWebAppList();
    // console.log(appList);

    // 改为二维数组
    const webApplist = _.chunk(appList, 6);
    // console.log(webApplist);

    // 补充满，每组6个
    for (let i = 0; i < webApplist.length; i++) {
      const tmpOneLevel = webApplist[i];
      if (_.isArray(tmpOneLevel)) {
        while (tmpOneLevel.length < 6) {
          const tmpAppObj = {
            appid: '',
            app_name: '',
            open_url: '',
          };
          tmpOneLevel.push(tmpAppObj);
        }
      }
    }
    // console.log(webApplist);
    data.app_list = webApplist;

    // 总数目
    const total = data.app_list.length;
    data.all_data.total = total;

    await ctx.render('store/quick.ejs', data);
  }

  /*
   * html - 应用列表
   */
  async index() {
    const self = this;
    const { app, ctx, service } = this;
    const query = ctx.query;

    const data = {
      navigation: 'store',
      app_list: [],
      all_data: null,
      now_installing: 'no',
      search_param_str: JSON.stringify(query),
      search_param: query,
    };

    query.debug = 0;
    if (app.config.env === 'local') {
      query.debug = 1;
    }

    const params = {
      out_url: 'appList',
      method: 'GET',
      data: query,
    };
    // console.log('params:%j', params);
    const appRes = await service.outapi.api(params);

    if (appRes.code === CODE.SUCCESS) {
      // 列表数据处理
      const tmpAppList = appRes.data.list.data;
      // console.log('tmpAppList:%j', tmpAppList);
      if (!_.isEmpty(tmpAppList)) {
        for (let i = 0; i < tmpAppList.length; i++) {
          const one = tmpAppList[i];
          // 应用是否正在安装
          // one.is_installing = true;
          one.is_installing = await service.store.appIsInstalling(one.appid);
          if (one.is_installing) {
            data.now_installing = 'yes';
          }

          // 检查是否安装
          one.show = null;
          const installRes = await service.store.appIsInstallForMyapp(
            one.appid
          );
          // console.log('one.appid:%j, res:%j', one.appid, installRes);
          if (installRes) {
            one.is_install = true;
          }

          // 文档地址
          one.show = commonConfig.docPath.gitee + one.appid;
        }
      }

      data.app_list = appRes.data.list.data;
      // 所有数据
      data.all_data = appRes.data.list;
    }

    await ctx.render('store/index.ejs', data);
  }

  /*
   * html - 我的应用
   */
  async myApp() {
    const self = this;
    const { app, ctx, service } = this;
    const query = ctx.query;
    const page = Number(query.page) > 1 ? Number(query.page) : 1;

    const data = {
      navigation: 'my_app',
      app_list: [],
      all_data: {
        total: 0,
        current_page: page,
        last_page: 1,
      },
    };

    const appList = await service.store.myAppList(page);
    // console.log(appList);

    if (!_.isEmpty(appList)) {
      // 列表数据处理
      if (!_.isEmpty(appList)) {
        for (let i = 0; i < appList.length; i++) {
          const one = appList[i];
          one.is_running = false;
          one.is_new_version = false;

          // 是否启动
          const runRes = await service.store.appIsRunning(one.appid);
          if (runRes) {
            one.is_running = true;
          }

          // 是否有更新
          // const newVersionRes = await service.store.appHasNewVersion(
          //   one.appid,
          //   one.version
          // );
          // if (newVersionRes) {
          //   one.is_new_version = true;
          // }

          // 配置文件地址
          one.config_dir_url =
            app.baseDir + '/docker/addons/' + one.appid + '/config';

          // 文档地址
          one.show = commonConfig.docPath.gitee + one.appid;
        }
      }
      // console.log(appList);
      data.app_list = appList;
    }

    // 总数目
    const total = await service.lowdb.getMyappNum();
    data.all_data.total = total;

    await ctx.render('store/myapp.ejs', data);
  }

  /*
   * html - 讨论
   */
  async chat() {
    const { app, ctx, service } = this;

    const data = {
      navigation: 'chat',
    };
    await ctx.render('store/chat.ejs', data);
  }

  /*
   * html - 帮助
   */
  async help() {
    const { app, ctx, service } = this;
    const md = new MarkdownIt();
    // win 10
    const winFile = fs.readFileSync(
      this.app.baseDir + '/markdown/windows.md',
      'utf-8'
    );
    const winFileHtml = md.render(winFile);

    // centos
    const centosFile = fs.readFileSync(
      this.app.baseDir + '/markdown/centos.md',
      'utf-8'
    );
    const centosFileHtml = md.render(centosFile);

    // debian
    const debianFile = fs.readFileSync(
      this.app.baseDir + '/markdown/debian.md',
      'utf-8'
    );
    const debianFileHtml = md.render(debianFile);

    // fedora
    const fedoraFile = fs.readFileSync(
      this.app.baseDir + '/markdown/fedora.md',
      'utf-8'
    );
    const fedoraFileHtml = md.render(fedoraFile);

    // mac
    const macFile = fs.readFileSync(
      this.app.baseDir + '/markdown/mac.md',
      'utf-8'
    );
    const macFileHtml = md.render(macFile);

    // ubuntu
    const ubuntuFile = fs.readFileSync(
      this.app.baseDir + '/markdown/ubuntu.md',
      'utf-8'
    );
    const ubuntuFileHtml = md.render(ubuntuFile);

    // 镜像加速器
    const mirrorFile = fs.readFileSync(
      this.app.baseDir + '/markdown/mirror.md',
      'utf-8'
    );
    const mirrorFileHtml = md.render(mirrorFile);

    const data = {
      navigation: 'help',
      win_file_html: winFileHtml,
      centos_file_html: centosFileHtml,
      debian_file_html: debianFileHtml,
      fedora_file_html: fedoraFileHtml,
      mac_file_html: macFileHtml,
      ubuntu_file_html: ubuntuFileHtml,
      mirror_file_html: mirrorFileHtml,
    };
    await ctx.render('store/help.ejs', data);
  }

  /*
   * html - 版本信息
   */
  async version() {
    const { app, ctx, service } = this;

    let has_new_version = false;

    // 本地版本
    const localDappsInfo = await service.lowdb.getDapps();
    console.log(localDappsInfo);
    const localVersion = localDappsInfo.version;

    // 线上版本
    const params = {
      out_url: 'dappsInfo',
      method: 'GET',
      data: {},
    };

    const dappsInfoRes = await service.outapi.api(params);
    if (dappsInfoRes.code === CODE.SUCCESS) {
      const onlineVersion = dappsInfoRes.data.version;
      console.log(
        'localVersion:%j, onlineVersion:%j',
        localVersion,
        onlineVersion
      );
      const compareRes = utils.compareVersion(localVersion, onlineVersion);
      console.log('compareRes:%j', compareRes);
      if (compareRes) {
        has_new_version = true;
      }
    }

    const data = {
      navigation: 'version',
      current_version: localVersion,
      has_new_version,
    };
    await ctx.render('store/version.ejs', data);
  }

  /*
   * api - APP安装
   */
  async appInstall() {
    const self = this;
    const { app, ctx, service } = this;
    const query = ctx.query;
    const appid = query.appid;

    if (!appid) {
      self.sendFail({}, '参数错误', CODE.SYS_PARAMS_ERROR);
      return;
    }

    // 是否有正在安装的程序
    const flag = await this.service.lowdb.getInstallingAppFlag();
    if (flag) {
      self.sendFail(
        {},
        '另外一个程序正在安装，请稍后再试',
        CODE.DAPPS_OHTER_APP_INSTALLING
      );
      return;
    }

    // 用户是否安装docker
    const checkRes = await service.store.checkDocker();
    if (checkRes.code !== CODE.SUCCESS) {
      self.sendFail({}, checkRes.msg, checkRes.code);
      return;
    }

    // 仓库中是否用应用
    const params = {
      out_url: 'appInfo',
      method: 'GET',
      data: {
        appid,
      },
    };
    const appInfoRes = await service.outapi.api(params);
    // console.log(appInfoRes);
    if (_.isEmpty(appInfoRes.data)) {
      self.sendFail({}, '商店中没有该应用', CODE.SYS_PARAMS_ERROR);
      return;
    }

    // github和gitee仓库中是否有zip文件

    service.store.installApp(query);

    // 增加下载次数
    const dparams = {
      out_url: 'incrDownload',
      method: 'POST',
      data: {
        appid,
      },
    };
    service.outapi.api(dparams);

    const data = {};
    self.sendSuccess(data, '正在安装中，请稍后刷新...');
  }

  /*
   * api - APP卸载
   */
  async appUninstall() {
    const self = this;
    const { app, ctx, service } = this;
    const query = ctx.query;
    const appid = query.appid;

    const delRes = await service.store.uninstallApp(appid);
    if (delRes.code !== CODE.SUCCESS) {
      self.sendFail({}, delRes.msg, CODE.SYS_OPERATION_FAILED);
      return;
    }

    const data = {};
    self.sendSuccess(data, '卸载成功');
  }

  /*
   * api - APP更新
   */
  async appUpdate() {
    const self = this;
    const { app, ctx, service } = this;
    const query = ctx.query;
    const appid = query.appid;

    if (!appid) {
      self.sendFail({}, '参数错误', CODE.SYS_PARAMS_ERROR);
      return;
    }

    await service.store.updateApp(appid);

    const data = {};
    self.sendSuccess(data, '正在更新中，请稍后刷新...');
  }

  /*
   * api - APP启动
   */
  async appStart() {
    const self = this;
    const { app, ctx, service } = this;
    const query = ctx.query;
    const appid = query.appid;
    if (!appid) {
      self.sendFail({}, '参数错误', CODE.SYS_PARAMS_ERROR);
      return;
    }

    const startRes = await service.store.startApp(appid);
    if (startRes.code !== CODE.SUCCESS) {
      self.sendFail({}, startRes.msg, startRes.code);
      return;
    }

    const data = {};
    self.sendSuccess(data, '启动成功');
  }

  /*
   * api - APP停止
   */
  async appStop() {
    const self = this;
    const { app, ctx, service } = this;
    const query = ctx.query;
    const appid = query.appid;
    if (!appid) {
      self.sendFail({}, '参数错误', CODE.SYS_PARAMS_ERROR);
      return;
    }

    const stopRes = await service.store.stopApp(appid);
    if (stopRes.code !== CODE.SUCCESS) {
      self.sendFail({}, stopRes.msg, stopRes.code);
      return;
    }

    const data = {};
    self.sendSuccess(data, '应用已停止');
  }

  /*
   * api - dapps是否有新的版本
   */
  async checkSysVersion() {
    const self = this;
    const { app, ctx, service } = this;

    let has_new_version = false;

    // 本地版本
    const localDappsInfo = await service.lowdb.getDapps();
    console.log('local DappsInfo:%j', localDappsInfo);
    const localVersion = localDappsInfo.version;

    // 获取线上dappsinfo
    const dappsInfoRes = await service.store.getDappsInfo();
    console.log('online dappsInfo:%j', dappsInfoRes);
    // 线上版本
    const onlineVersion = dappsInfoRes.version;
    const compareRes = utils.compareVersion(localVersion, onlineVersion);
    console.log('compareRes:%j', compareRes);
    if (compareRes) {
      has_new_version = true;
    }

    const data = {
      current_version: localVersion,
      has_new_version,
    };

    self.sendSuccess(data);
  }
}

module.exports = StoreController;
