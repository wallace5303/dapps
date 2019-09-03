'use strict';

const Service = require('egg').Service;
const _ = require('lodash');
const moment = require('moment');

class BaseService extends Service {
  /*
   * mysql
   * @params: string db
   * @return: object
   */
  mysqlClient(db) {
    if (!db) {
      db = 'lottery1';
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
      db = 'lottery1';
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
}

module.exports = BaseService;
