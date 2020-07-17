'use strict';
const _ = require('lodash');

module.exports = () => {
  return async function auth(ctx, next) {
    let token = null;
    let username = null;
    const body = ctx.request.body;
    ctx.body = {
      success: false,
      code: CODE.SYS_NOT_LOGING,
      msg: '请重新登录',
    };
    if (!body.token || !body.username) {
      const query = ctx.query;
      if (!query.token || !query.username) {
        return ctx.body;
      } else {
        token = body.token;
        username = body.username;
      }
    } else {
      token = body.token;
      username = body.username;
    }

    console.log("token", token);
    console.log("username", username);
    var userInfo = await ctx.service.lowdb.getToken(username);
    if (_.get(userInfo, 'token') !== token) {
      return ctx.body;
    }
    ctx.body.success = CODE.SUCCESS;
    ctx.body.msg = 'ok';

    ctx.userInfo = userInfo;
    await next();
  };
};
