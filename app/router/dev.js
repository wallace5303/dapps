'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const auth = app.middleware.auth();

  // html
  // 开发者模式
  router.get('/html/v1/dev/index', controller.v1.dev.index);

  // api
  // 应用卸载
  router.post('/api/v1/dev/app_uninstall', auth, controller.v1.dev.appUninstall);
  // 应用启动
  router.post('/api/v1/dev/app_start', auth, controller.v1.dev.appStart);
  // 应用停止
  router.post('/api/v1/dev/app_stop', auth, controller.v1.dev.appStop);
  // 应用创建
  router.post('/api/v1/dev/app_create', auth, controller.v1.dev.appCreate);
};
