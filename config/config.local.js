'use strict';
// 本地环境-配置文件

/*
 * 远程调用
 */
exports.outApi = {
  dappsInfo: 'http://kaka996-php.local.com/api/dapps/info',
  appInfo: 'http://kaka996-php.local.com/api/dapps/store/app_info',
  appList: 'http://kaka996-php.local.com/api/dapps/store/app_list',
  allAppList: 'http://kaka996-php.local.com/api/dapps/store/all_app_list',
  login: 'http://kaka996-php.local.com/api/dapps/login',
  register: 'http://kaka996-php.local.com/api/dapps/register',
  developerAppUpdate:
    'http://kaka996-php.local.com/api/dapps/store/developer_app_update',
  developerAppList:
    'http://kaka996-php.local.com/api/dapps/store/developer_app_list',
  userinfo: 'http://kaka996-php.local.com/api/dapps/user/info',
  incrDownload: 'http://kaka996-php.local.com/api/dapps/store/incr_download',
  webSites: 'http://kaka996-php.local.com/api/dapps/web/sites',
};

exports.logger = {
  dir: './logs/local',
};
