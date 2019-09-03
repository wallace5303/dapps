'use strict';

const BaseController = require('../base');
const _ = require('lodash');
const commonConfig = require('../../config/commonConfig');
const msgConfig = require('../../config/msgConfig');

class SmsController extends BaseController {
  /*
   * 发送短信验证码
   * @params: string phone
   * @return: object { }
   */
  async sendCode() {
    const self = this;
    const { app, ctx, service } = this;
    let { phone, country, agent_uid } = ctx.request.body;
    agent_uid = agent_uid ? Number(agent_uid) : 0;
    country = country ? country : '86';
    const cphone = country + phone;
    app.logger.info(
      '[SmsController] [sendCode] country:%j, phone:%j, agent_uid:%j',
      country,
      phone,
      agent_uid
    );
    if (phone.length < 8 || phone.length > 11) {
      self.sendFail(
        {},
        msgConfig.SYS_PARAMS_ERROR[this.lang],
        CODE.SYS_PARAMS_ERROR
      );
      return;
    }

    let isTestAccount = false;
    if (_.includes(commonConfig.testAccount, cphone)) {
      isTestAccount = true;
    }

    // 同一手机号发送短信限制
    if (!isTestAccount) {
      const checkRes = await service.sms.isAllowSend(cphone);
      if (!checkRes) {
        self.sendFail(
          {},
          msgConfig.PHONE_SEND_SMS_TOO_OFTEN[this.lang],
          CODE.PHONE_SEND_SMS_TOO_OFTEN
        );
        return;
      }
    }

    const result = await service.center.sms_phone(country, phone, agent_uid);
    if (result.errcode !== CODE.SUCCESS) {
      self.sendFail(
        result,
        msgConfig.SYS_UNKNOWN_ERROR[this.lang],
        CODE.SYS_UNKNOWN_ERROR
      );
      return;
    }

    const data = {};
    if (app.config.env !== 'prod') {
      data.sms_code = '123456';
    }

    self.sendSuccess(data, '发送成功');
  }
}

module.exports = SmsController;
