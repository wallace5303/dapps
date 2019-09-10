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
      return ctx.body;
    }

    await next();
  };
};
