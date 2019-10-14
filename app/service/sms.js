'use strict';

const BaseService = require('./base');
const _ = require('lodash');
const ROAClient = require('@alicloud/pop-core').ROAClient;
const smsConfig = require('../config/smsConfig');
const commonConfig = require('../config/commonConfig');

class SmsService extends BaseService {
  /*
   * 检查验证码
   * @params: string phone
   * @params: string code
   * @return: bool
   */
  async checkCode(phone, code) {
    const realCode = await this.service.redis.getSmsCode(phone);
    const res = code == realCode;

    return res;
  }

  /*
   * 发送验证码
   * @params: string phone
   * @return: int
   */
  async sendSmsCode(country, phone, cphone) {
    const res = {
      resCode: CODE.SUCCESS,
      msg: '',
      code: 0,
    };

    if (!country || !phone || !cphone) {
      res.resCode = CODE.SYS_PARAMS_ERROR;
      res.msg = '参数错误！';
      return res;
    }

    if (_.includes(commonConfig.testAccount, cphone)) {
      res.code = '123456';
      return res;
    }

    // 检查时间
    const ttlTime = await this.service.redis.getTtlTimeForSmsCode(cphone);

    // 过期时间300秒
    if (ttlTime > 0 && 300 - ttlTime < 60) {
      res.resCode = CODE.SMS_REQUEST_TOO_OFTEN;
      res.msg = '请求过于频繁，请稍后再试！';
      return res;
    }

    const code = this.getSmsCode();
    await this.service.redis.setSmsCode(cphone, code);
    if (this.app.config.env === 'prod') {
      let style = 'jianxun';
      if (country !== '+86') {
        style = 'aws';
      }
      const sendRes = await this.doSendSmsCode(
        country,
        phone,
        cphone,
        code,
        style
      );
      if (sendRes !== CODE.SUCCESS) {
        res.resCode = CODE.SMS_SEND_ERROR;
        res.msg = '网络异常，请重试！';
        return res;
      }
    }
    await this.service.redis.incSendSmsTimes(cphone);
    res.code = code;

    return res;
  }

  /*
   * 执行发送
   * @params: string phone
   * @params: string code
   * @return: int
   */
  async doSendSmsCode(country, phone, cphone, code, style = 'jianxun') {
    let res = CODE.SUCCESS;
    switch (style) {
      case 'ali':
        res = await this.smsFromAli(country, phone, cphone, code);
        break;
      default:
    }

    return res;
  }

  /*
   * 阿里短信
   */
  async smsFromAli(country, phone, cphone, msg) {
    const client = new ROAClient(smsConfig.ali.accessInfo);
    const msgParams = {
      PhoneNumbers: phone,
      SignName: smsConfig.ali.sign,
      TemplateCode: 'SMS_153055065',
      TemplateParam: { code: msg },
    };

    try {
      let result = await client.request('POST', '/SendSms', msgParams);
      result = JSON.parse(result);
      if (result.Code === 'OK') {
        return CODE.SUCCESS;
      }
    } catch (e) {
      this.app.logger.error('[smsService] [smsFromAli] send sms error', e);
    }

    return CODE.SMS_SEND_ERROR;
  }

  /*
   * 生成code
   * params: string length
   * @return: string
   */
  getSmsCode(length = 6) {
    const nums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let code = '';
    let pos = null;
    for (let i = 0; i < length; i++) {
      pos = _.random(0, 9);
      code += nums[pos];
    }

    return code;
  }

  /*
   * 检查发送限制
   */
  async isAllowSend(phone) {
    if (this.app.config.env !== 'prod') {
      return true;
    }
    const times = await this.service.redis.getSendSmsTimes(phone);
    if (times >= 50) {
      return false;
    }

    return true;
  }
}

module.exports = SmsService;
