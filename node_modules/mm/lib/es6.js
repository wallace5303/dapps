'use strict';

const is = require('is-type-of');
const sleep = require('ko-sleep');
const mm = require('./mm');

const mockDatas = mm.datas;
// support generator
mm.datas = function(mod, method, datas, timeout) {
  if (!is.generatorFunction(mod[method])) {
    return mockDatas.call(mm, mod, method, datas, timeout);
  }

  if (timeout) {
    timeout = parseInt(timeout, 10);
  }
  timeout = timeout || 0;
  mm(mod, method, function* () {
    yield sleep(timeout);
    return datas;
  });
  return this;
};

const mockData = mm.data;
mm.data = function(mod, method, data, timeout) {
  if (!is.generatorFunction(mod[method])) {
    return mockData.call(mm, mod, method, data, timeout);
  }

  return mm.datas(mod, method, data, timeout);
};

const mockError = mm.error;
mm.error = function(mod, method, error, props, timeout) {
  if (!is.generatorFunction(mod[method])) {
    return mockError.call(mm, mod, method, error, props, timeout);
  }

  error = mm._createError(error, props);

  if (timeout) {
    timeout = parseInt(timeout, 10);
  }
  timeout = timeout || 0;
  mm(mod, method, function* () {
    yield sleep(timeout);
    throw error;
  });
  return this;
};

const mockErrorOnce = mm.errorOnce;
mm.errorOnce = function(mod, method, error, props, timeout) {
  if (!is.generatorFunction(mod[method])) {
    return mockErrorOnce.call(mm, mod, method, error, props, timeout);
  }

  error = mm._createError(error, props);

  if (timeout) {
    timeout = parseInt(timeout, 10);
  }
  timeout = timeout || 0;
  mm(mod, method, function* () {
    yield sleep(timeout);
    mm.restore();
    throw error;
  });
  return this;
};
