'use strict';

const BaseService = require('./base');
const crypto = require('crypto');
const commonConfig = require('../config/commonConfig');
const utilsIndex = require('../utils/index');
const moment = require('moment');
const _ = require('lodash');

class UserService extends BaseService {

  /*
  * 生成access_token
  * @params: string uid
  * @return: string
  */
  createAccessToken(uid) {
    var secretKey = commonConfig.secretKey;
    var access_token = crypto.createHash('md5').update(uid)
      .update(secretKey).update(Date.now().toString()).digest('hex');

    return access_token;
  }

}

module.exports = UserService;
