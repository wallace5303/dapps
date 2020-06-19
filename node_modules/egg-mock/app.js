'use strict';

module.exports = app => {
  // make sure clusterAppMock position before securities
  const index = app.config.coreMiddleware.indexOf('securities');
  if (index >= 0) {
    app.config.coreMiddleware.splice(index, 0, 'clusterAppMock');
  } else {
    app.config.coreMiddleware.push('clusterAppMock');
  }
};
