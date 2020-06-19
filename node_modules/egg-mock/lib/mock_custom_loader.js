'use strict';

module.exports = app => {
  const customLoader = app.config.customLoader;
  if (!customLoader) return;

  for (const field of Object.keys(customLoader)) {
    const loaderConfig = Object.assign({}, customLoader[field]);
    loaderConfig.field = field;
    addMethod(loaderConfig);
  }

  function addMethod(loaderConfig) {
    const field = loaderConfig.field;
    const appMethodName = 'mock' + field.replace(/^[a-z]/i, s => s.toUpperCase());
    if (app[appMethodName]) {
      app.coreLogger.warn('Can\'t override app.%s', appMethodName);
      return;
    }
    app[appMethodName] = function(service, methodName, fn) {
      if (typeof service === 'string') {
        const arr = service.split('.');
        service = loaderConfig.inject === 'ctx' ? this[field + 'Classes'] : this[field];
        for (const key of arr) {
          service = service[key];
        }
        service = service.prototype || service;
      }
      this._mockFn(service, methodName, fn);
      return this;
    };
  }
};
