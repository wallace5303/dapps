'use strict';

const Service = require('egg').Service;
const _ = require('lodash');
const moment = require('moment');
const utils = require('../utils/utils');

class BaseService extends Service {
  /*
   * mysql
   * @params: string db
   * @return: object
   */
  mysqlClient(db) {
    if (!db) {
      db = 'user';
    }

    return this.app.mysql.get(db);
  }

  /*
   * redis
   * @params: string db
   * @return: object
   */
  redisClient(db) {
    if (!db) {
      db = 'user';
    }

    return this.app.redis.get(db);
  }

  /*
   * 列表字段整理
   */
  dealList(list) {
    if (_.isEmpty(list)) {
      return list;
    }
    let tmpObj = null;
    for (let i = 0; i < list.length; i++) {
      tmpObj = list[i];
      if (tmpObj.created_at) {
        tmpObj.created_at = moment(tmpObj.created_at).format(
          'Y-MM-DD HH:mm:ss'
        );
      }
    }

    return list;
  }

  /*
  * public ip
  */
  async getPublicIp() {

    try {
      const urlArr = [
        //'http://ipinfo.io/json',
        'http://icanhazip.com/'
      ];
      let index = 0;
      const url = urlArr[index];
      const response = await this.app.curl(url, {
        method: 'GET',
        contentType: 'text/plain',
        data: {},
        dataType: 'text',
        timeout: 5000,
      });

      const ip = _.get(response, ['data'], null).replace(/[\r\n]/g,"");

      return ip;
    } catch (e) {
      console.log('[BaseService] [publicIp]: error ', e);
    }

    return null;
  };

  async smartIp () {
    let ip = '';
    let remoteIp = this.ctx.request.ip;
    let localIp = utils.getIPAddress();
    let publicIp = await this.getPublicIp();

    let isLNA = utils.isEqualIPAddress(remoteIp, localIp);
    ip = isLNA ? localIp : publicIp;
    return ip;
  }



}

module.exports = BaseService;
