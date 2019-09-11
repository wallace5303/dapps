'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const auth = app.middleware.auth();

  // html
  // 注册&&登录
  router.get('/html/v1/register', controller.v1.entry.registerHtml);
  router.get('/html/v1/login', controller.v1.entry.loginHtml);

  // api
  router.get('/api/v1/sys_info', controller.v1.home.sysInfo);
  router.post('/api/v1/home/outapi', controller.v1.home.outApi);
};
