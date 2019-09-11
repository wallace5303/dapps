'use strict';

const BaseService = require('./base');
const _ = require('lodash');
const moment = require('moment');

class OutapiService extends BaseService {
  /*
   * api
   */
  async api(body) {
    const res = {
      code: 1000,
      message: 'unknown error',
    };

    try {
      const url = this.app.config.outApi[body.out_url];
      const response = await this.app.curl(url, {
        method: body.method,
        contentType: 'application/json',
        data: body.data,
        dataType: 'json',
        timeout: 15000,
      });
      const result = response.data;
      // this.app.logger.info('[OutapiService] [api]: result:%j', result);
      if (result.code !== CODE.SUCCESS) {
        this.app.logger.error('[OutapiService] [api]: error result:%j', result);
      }
      return result;
    } catch (e) {
      this.app.logger.error('[OutapiService] [api]: error ', e);
    }

    return res;
  }
}

module.exports = OutapiService;
