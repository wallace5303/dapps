'use strict';

const BaseService = require('./base');
const crypto = require('crypto');
const commonConfig = require('../config/commonConfig');
const utilsIndex = require('../utils/index');
const moment = require('moment');
const _ = require('lodash');

class UserService extends BaseService {
  /*
   * 获取用户 by id
   * @params: string uid
   * @return: object
   */
  async getUserByUid(uid, allData = true) {
    let userInfo = await this.service.redis.getUserInfo(uid);
    if (!userInfo) {
      userInfo = await this.mysqlClient().get('user', { uid });
      if (userInfo) {
        await this.service.redis.setUserInfo(uid, userInfo);
      }
    }
    if (!allData && userInfo) {
      userInfo = this.service.user.dealUserData(userInfo);
    }

    return userInfo;
  }

  /*
   * 用户部分数据
   */
  dealUserData(userInfo) {
    const user = {
      uid: userInfo.uid,
      username: userInfo.username,
      phone: userInfo.phone,
      avatar: userInfo.avatar,
      last_online_time: userInfo.last_online_time,
    };

    return user;
  }
  /*
   * 获取用户 by username
   * @params: string username
   * @return: object
   */
  async getUserByName(username) {
    const user = await this.mysqlClient().get('user', { username });
    return user;
  }

  /*
   * 获取用户 by phone
   * @params: string phone
   * @return: object
   */
  async getUserByPhone(country, phone) {
    const user = await this.mysqlClient().get('user', { country, phone });
    return user;
  }

  /*
   * 注册用户
   */
  async register(username, email, pwd1, pwd2) {
    const res = {
      code: 1000,
      msg: 'unknown error',
    };

    try {
      const params = {
        username,
        email,
        pwd1,
        pwd2,
      };
      const url = this.app.config.outApi.register;
      const response = await this.app.curl(url, {
        method: 'POST',
        contentType: 'application/json',
        data: params,
        dataType: 'json',
        timeout: 15000,
      });
      const result = response.data;
      this.app.logger.info('[UserService] [register]: result:%j', result);
      if (result.code !== CODE.SUCCESS) {
        this.app.logger.error(
          '[UserService] [register]: error result:%j',
          result
        );
      }
      return result;
    } catch (e) {
      this.app.logger.error('[UserService] [register]: error ', e);
    }

    return res;
  }
}

module.exports = UserService;
