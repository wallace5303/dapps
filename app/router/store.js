'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const auth = app.middleware.auth();

  // html
  // 商店列表
  router.get('/html/v1/store/list', controller.v1.store.index);
  router.get('/html/v1/store/myapp', controller.v1.store.myApp);
  router.get('/html/v1/store/chat', controller.v1.store.chat);

  // api
  // 应用安装
  router.get('/api/v1/store/app_install', controller.v1.store.appInstall);
  // 应用卸载
  router.get('/api/v1/store/app_uninstall', controller.v1.store.appUninstall);
  // 应用启动
  router.get('/api/v1/store/app_start', controller.v1.store.appStart);
  // 应用停止
  router.get('/api/v1/store/app_stop', controller.v1.store.appStop);
  // 应用更新
  router.get('/api/v1/store/app_update', controller.v1.store.appUpdate);
};
