'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, swagger } = app;

  router.get('/api/test/index', controller.test.index);
};
