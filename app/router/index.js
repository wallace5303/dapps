'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  // 首页
  router.get('/', controller.v1.store.index);

  // 引入其他路由
  require('./initialize')(app);
  require('./user')(app);
  require('./test')(app);
  require('./sms')(app);
  require('./store')(app);
  require('./home')(app);
};
