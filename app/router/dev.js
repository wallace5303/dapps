'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  // html
  // 开发者模式
  router.get('/html/v1/dev/index', controller.v1.dev.index);

  // api
  // 应用卸载
  router.get('/api/v1/dev/app_uninstall', controller.v1.dev.appUninstall);
  // 应用启动
  router.get('/api/v1/dev/app_start', controller.v1.dev.appStart);
  // 应用停止
  router.get('/api/v1/dev/app_stop', controller.v1.dev.appStop);
};
