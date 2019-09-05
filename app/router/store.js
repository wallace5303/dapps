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

  // api
  // 应用安装
  router.post('/api/v1/store/app_install', controller.v1.store.install);
};
