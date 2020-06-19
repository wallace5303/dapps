'use strict';

module.exports = app => {
  // if true, then don't need to wait at local development mode
  if (app.config.development.fastReady) process.nextTick(() => app.ready(true));
  app.config.coreMiddlewares.push('eggLoaderTrace');
};
