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
    // gitee:'https://gitee.com/wallace5303/dapps-addons/raw/master/zip/dapps.zip',
    gitee:
      'https://github.com/wallace5303/dapps-addons/raw/master/zip/dapps.zip',
  },

  // 插件包路径, gitee 不知道大文件下载，导致没法更新，统一用GitHub
  addonsPath: {
    github: 'https://github.com/wallace5303/dapps-addons/raw/master/zip/',
    // gitee: 'https://gitee.com/wallace5303/dapps-addons/raw/master/zip/',
    gitee: 'https://github.com/wallace5303/dapps-addons/raw/master/zip/',
  },
};
