/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path');
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1552879336505_7432';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  config.cluster = {
    listen: {
      port: 8000,
      hostname: '0.0.0.0',
      // path: '/var/run/egg.sock',
    },
  };

  // jwt插件配置(盐)
  config.jwt = {
    secret: 'jcgame88',
  };

  /* 跨域插件配置-start */
  config.security = {
    xframe: {
      enable: false,
    },
    ignore: '/api',
    // 跨域允许的域名列表-配置
    domainWhiteList: [
      '*',
      // 'http://127.0.0.1:8080'
    ],
    methodnoallow: { enable: false },
    // 安全配置(很重要)
    csrf: {
      enable: false,
      ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
    },
  };
  // 允许的跨域请求类型(GET,POST)
  config.cors = {
    origin: '*',
    // allowMethods: 'GET,POST',
    allowMethods: 'GET,POST,HEAD,PUT,OPTIONS,DELETE,PATCH',
  };
  /* 跨域插件配置-end */

  // 校验插件配置(支持 parameter的所有配置项)
  config.validate = {
    // convert: false,
    // validateRoot: false,
  };

  // 获取真实ip
  config.maxProxyCount = 2;

  config.view = {
    root: [path.join(appInfo.baseDir, 'app/view')].join(','),
    mapping: {
      '.ejs': 'ejs',
    },
  };

  config.ejs = {};

  return {
    ...config,
    ...userConfig,
  };
};
