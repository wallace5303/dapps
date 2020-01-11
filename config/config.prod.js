'use strict';
// 服务器环境-配置文件

/*
 * 远程调用
 */
exports.outApi = {
  dappsInfo: 'http://www.kaka996.com/api/dapps/info',
  appInfo: 'http://www.kaka996.com/api/dapps/store/app_info',
  appList: 'http://www.kaka996.com/api/dapps/store/app_list',
  allAppList: 'http://www.kaka996.com/api/dapps/store/all_app_list',
  login: 'http://www.kaka996.com/api/dapps/login',
  register: 'http://www.kaka996.com/api/dapps/register',
  developerAppUpdate:
    'http://www.kaka996.com/api/dapps/store/developer_app_update',
  developerAppList: 'http://www.kaka996.com/api/dapps/store/developer_app_list',
  userinfo: 'http://www.kaka996.com/api/dapps/user/info',
  incrDownload: 'http://www.kaka996.com/api/dapps/store/incr_download',
  webSites: 'http://www.kaka996.com/api/dapps/web/sites',
};

exports.logger = {
  dir: './logs/prod',
};
