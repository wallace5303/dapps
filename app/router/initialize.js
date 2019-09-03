'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const auth = app.middleware.auth();
  // 初始化
  router.get('/api/v1/initialize/index', auth, controller.v1.initialize.index);
};
