'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;

    // 添加用户
    //router.post('/api/v1/admin_user/add_user', controller.v1.adminUser.addUser);

    router.post('/api/v1/admin/login', controller.v1.adminUser.login);
    router.post('/api/v1/admin/modify_pwd', controller.v1.adminUser.modifyPwd);
};
