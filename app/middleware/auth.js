'use strict';

module.exports = () => {
  return async function auth(ctx, next) {
    const { accesstoken, uid, language } = ctx.request.header;
    ctx.body = {
      success: false,
      code: CODE.SYS_NOT_LOGING,
      msg: '请登录',
    };

    if (!uid || !accesstoken) {
      // ctx.body.code = CODE.SYS_PARAMS_ERROR;
      return ctx.body;
    }

    const centerUser = await ctx.service.center.centerUser(uid);
    if (!centerUser) {
      return ctx.body;
    }
    const real_access_token = centerUser.token;

    // const real_access_token = await ctx.service.redis.getAccessTokenByUid(uid);
    // if (!real_access_token) {
    //   // ctx.body.code = CODE.USER_ACCESS_TOKEN_INVALID;
    //   return ctx.body;
    // }
    if (accesstoken !== real_access_token) {
      // ctx.body.code = CODE.SYS_INVALID_REQUEST;
      return ctx.body;
    }

    // const userInfo = await ctx.service.center.centerUser(uid, false);
    // if (!userInfo) {
    //   // ctx.body.code = CODE.SYS_UNKNOWN_ERROR;
    //   return ctx.body;
    // }
    ctx.userInfo = centerUser;
    await next();
  };
};
