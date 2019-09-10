'use strict';

const BaseService = require('./base');
const _ = require('lodash');
const moment = require('moment');

class StoreService extends BaseService {
  /*
   * 商店应用列表
   */
  async appList(all, page, appid, author, sortField, sortType) {
    const res = {
      code: 1000,
      msg: 'unknown error',
    };

    try {
      const params = {
        all,
        page,
        appid,
        author,
        sort_field: sortField,
        sort_type: sortType,
      };
      const url = this.app.config.outApi.appList;
      const response = await this.app.curl(url, {
        method: 'GET',
        contentType: 'application/json',
        data: params,
        dataType: 'json',
        timeout: 15000,
      });
      const result = response.data;
      // this.app.logger.info('[StoreService] [appList]: result:%j', result);
      if (result.code !== CODE.SUCCESS) {
        this.app.logger.error(
          '[StoreService] [appList]: error result:%j',
          result
        );
      }
      return result;
    } catch (e) {
      this.app.logger.error('[StoreService] [appList]: error ', e);
    }

    return res;
  }
}

module.exports = StoreService;
