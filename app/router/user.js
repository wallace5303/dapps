'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const auth = app.middleware.auth();

  // 个人信息
  router.get('/api/v1/user/info', auth, controller.v1.user.info);

};
