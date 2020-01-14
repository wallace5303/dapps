'use strict';
module.exports = {
  // 加密的key
  secretKey: 'serverSideSecretKey',

  // 注册/登录类型
  accountType: {
    emailAndPassword: '1',
    phoneAndCode: '2',
  },

  // 文档国内路径
  docPath: {
    github: 'https://github.com/wallace5303/dapps-addons/tree/master/addons/',
    gitee: 'https://gitee.com/wallace5303/dapps-addons/tree/master/addons/',
  },

  // 主程序包路径
  dappsPath: {
    github:
      'https://github.com/wallace5303/dapps-addons/raw/master/zip/dapps.zip',
    coding: 'https://kaka996.coding.net/p/zip/git/raw/master/dapps.zip',
  },

  // 插件包路径，统一用coding
  addonsPath: {
    github:
      'https://raw.githubusercontent.com/wallace5303/dapps-addons/master/zip/',
    coding: 'https://kaka996.coding.net/p/zip/git/raw/master/',
  },
};
