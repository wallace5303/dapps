'use strict';

const koajwt = require('koa-jwt2');

module.exports = options => {
  return koajwt(options);
};
