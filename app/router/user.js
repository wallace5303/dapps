'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  // 个人信息
  router.get('/api/v1/user/info', controller.v1.user.info);
};
