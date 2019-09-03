'use strict';

const BaseService = require('./base');
const _ = require('lodash');
const moment = require('moment');

class ReportService extends BaseService {
  /*
   * 错误上报
   */
  async errorCollect(uid, environment, content) {
    if (!uid && !environment && !content) {
      return false;
    }
    const fields = {
      uid,
      environment: '',
      content,
    };

    const insertRes = await this.mysqlClient().insert('error_report', fields);
    if (insertRes.affectedRows !== 1) {
      return false;
    }

    return true;
  }
}

module.exports = ReportService;
