'use strict';

/*
 *Egg插件
 */

// exports.xcRedis = {
//   enable: true,
//   package: 'egg-xc-redis',
// };

// jwt登录状态验证插件
exports.jwt = {
  enable: true,
  package: 'egg-jwt',
};

// 跨域插件
exports.cors = {
  enable: true,
  package: 'egg-cors',
};

// 校验插件,基于parameter
exports.validate = {
  enable: true,
  package: 'egg-validate',
};

exports.ejs = {
  enable: true,
  package: 'egg-view-ejs',
};
