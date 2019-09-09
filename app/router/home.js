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
  // 登录页数据
  router.get('/api/v1/stat', controller.v1.home.stat);
  router.post('/api/v1/error_report', controller.v1.home.errorReport);
  router.get('/api/v1/sys_info', controller.v1.home.sysInfo);
  router.post('/api/v1/register', controller.v1.entry.register);
  router.post('/api/v1/login', controller.v1.entry.login);
};
