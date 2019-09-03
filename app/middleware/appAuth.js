'use strict';
const _ = require('lodash');
const openAuthConfig = require('../config/openAuthConfig');

module.exports = () => {
  return async function appAuth(ctx, next) {
    const body = ctx.request.body;
    const sign = body.sign;
    const appId = body.app_id;
    ctx.body = {
      code: CODE.SYS_INVALID_REQUEST,
      msg: '无效请求',
    };

    // 判断签名 TODO
    const signature = openAuthConfig.authInfo.key;
    if (sign !== signature) {
      ctx.body.code = CODE.API_AUTH_SIGN_ERROR;
      ctx.body.msg = '签名错误';
      return ctx.body;
    }

    // 判断app
    if (!_.includes(openAuthConfig.appIds, appId)) {
      ctx.body.code = CODE.API_AUTH_APP_ERROR;
      ctx.body.msg = '无效的appId';
      return ctx.body;
    }

    await next();
  };
};
