'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const auth = app.middleware.auth();

  // html
  router.get('/html/v1/store/quick', controller.v1.store.quick);
  // 商店列表
  router.get('/html/v1/store/list', controller.v1.store.index);
  router.get('/html/v1/store/myapp', controller.v1.store.myApp);
  router.get('/html/v1/store/chat', controller.v1.store.chat);
  router.get('/html/v1/store/help', controller.v1.store.help);
  router.get('/html/v1/store/version', controller.v1.store.version);
  router.get('/html/v1/store/appupdate', controller.v1.store.htmlAppUpdate);

  // api
  // 应用安装
  router.get('/api/v1/store/app_install', auth, controller.v1.store.appInstall);
  // 应用卸载
  router.get('/api/v1/store/app_uninstall', auth, controller.v1.store.appUninstall);
  // 应用启动
  router.get('/api/v1/store/app_start', auth, controller.v1.store.appStart);
  // 应用停止
  router.get('/api/v1/store/app_stop', auth, controller.v1.store.appStop);
  // 应用更新
  router.get('/api/v1/store/app_update', auth, controller.v1.store.appUpdate);
  // dapps是否有新的版本
  router.get(
    '/api/v1/store/check_sys_version',
    controller.v1.store.checkSysVersion
  );
};
