'use strict';
// 本地环境-配置文件

/*
 * 远程调用
 */
exports.outApi = {
  appList: 'http://192.168.10.233:8081/api/dapps/store/app_list',
  allAppList: 'http://192.168.10.233:8081/api/dapps/store/all_app_list',
  login: 'http://192.168.10.233:8081/api/dapps/login',
  register: 'http://192.168.10.233:8081/api/dapps/register',
  developerAppUpdate:
    'http://192.168.10.233:8081/api/dapps/store/developer_app_update',
  developerAppList:
    'http://192.168.10.233:8081/api/dapps/store/developer_app_list',
  userinfo: 'http://192.168.10.233:8081/api/dapps/user/info',
};
