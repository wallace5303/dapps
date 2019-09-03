'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

  // 短信
  router.post('/api/v1/sms/send_code', controller.v1.sms.sendCode);
};
