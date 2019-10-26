'use strict';
// 本地环境-配置文件

/*
 * 远程调用
 */
exports.outApi = {
  dappsInfo: 'http://test-www.kaka996.com/api/dapps/info',
  appInfo: 'http://test-www.kaka996.com/api/dapps/store/app_info',
  appList: 'http://test-www.kaka996.com/api/dapps/store/app_list',
  allAppList: 'http://test-www.kaka996.com/api/dapps/store/all_app_list',
  login: 'http://test-www.kaka996.com/api/dapps/login',
  register: 'http://test-www.kaka996.com/api/dapps/register',
  developerAppUpdate:
    'http://test-www.kaka996.com/api/dapps/store/developer_app_update',
  developerAppList:
    'http://test-www.kaka996.com/api/dapps/store/developer_app_list',
  userinfo: 'http://test-www.kaka996.com/api/dapps/user/info',
  incrDownload: 'http://test-www.kaka996.com/api/dapps/store/incr_download',
};

exports.logger = {
  dir: './logs/local',
};
