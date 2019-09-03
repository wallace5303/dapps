'use strict';

const BaseService = require('./base');
const _ = require('lodash');
const ROAClient = require('@alicloud/pop-core').ROAClient;
const smsConfig = require('../config/smsConfig');
const AWS = require('aws-sdk');
const vsprintf = require('sprintf-js').vsprintf;
const commonConfig = require('../config/commonConfig');
const qs = require('querystring');

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
      case 'aws':
        res = await this.smsFromAws(country, phone, cphone, code);
        break;
      case 'yunpian':
        res = await this.smsFromYunPian(country, phone, cphone, code);
        break;
      case 'jianxun':
        res = await this.smsFromJianXun(country, phone, cphone, code);
        break;
      default:
    }

    return res;
  }

  /*
   * 简讯短信
   */
  async smsFromJianXun(country, phone, cphone, msg) {
    const postData = {
      cmd: 'SendVerificationCode',
      user: smsConfig.jianxun.accessInfo.accessKeyId,
      signature: smsConfig.jianxun.accessInfo.accessKeySecret,
      mobile_Phone: phone,
      title: '库斯科',
      message: msg,
    };
    // var content = qs.stringify(postData);
    try {
      const url = smsConfig.jianxun.accessInfo.url;
      const response = await this.app.curl(url, {
        method: 'POST',
        contentType: 'json',
        data: postData,
        dataType: 'json',
      });
      const result = response.data;
      // console.log("response:", response);
      this.app.logger.info('[SmsService] [smsFromJianXun]: result:%j', result);
      if (result.error_Code === 200) {
        return CODE.SUCCESS;
      }
    } catch (e) {
      this.app.logger.error('[smsService] [smsFromJianXun] send sms error', e);
    }

    return CODE.SMS_SEND_ERROR;
  }

  /*
   * 云片短信
   */
  async smsFromYunPian(country, phone, cphone, msg) {
    const postData = {
      apikey: smsConfig.yunpian.accessInfo.accessKeyId,
      mobile: phone,
      text: msg,
    };
    // var content = qs.stringify(postData);
    try {
      const url =
        smsConfig.yunpian.accessInfo.sms_host +
        smsConfig.yunpian.accessInfo.sms_uri;
      const response = await this.app.curl(url, {
        method: 'POST',
        contentType: 'json',
        data: postData,
        dataType: 'json',
      });
      const result = response.data;
      // console.log("result:", response);
      this.app.logger.info('[SmsService] [smsFromYunPian]: result:%j', result);
      if (result.code === 0) {
        return CODE.SUCCESS;
      }
    } catch (e) {
      this.app.logger.error('[smsService] [smsFromYunPian] send sms error', e);
    }

    return CODE.SMS_SEND_ERROR;
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
   * 亚马逊短信
   */
  async smsFromAws(country, phone, cphone, msg) {
    const self = this;
    AWS.config.update({
      accessKeyId: smsConfig.aws.accessInfo.accessKeyId,
      secretAccessKey: smsConfig.aws.accessInfo.accessKeySecret,
      region: smsConfig.aws.accessInfo.region,
    });

    const message = vsprintf(commonConfig.smsContent.checkCode, [msg]);
    const sns = new AWS.SNS();
    const msgParams = {
      Message: String(message),
      PhoneNumber: String(cphone),
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    };

    return new Promise((resolve, reject) => {
      sns.publish(msgParams, function(err, data) {
        let code = null;
        if (err) {
          self.app.logger.error(
            '[smsService] [smsFromAws] send sms error',
            err.stack
          );
          code = CODE.SMS_SEND_ERROR;
        } else {
          code = CODE.SUCCESS;
        }
        self.app.logger.info(
          '[smsService] [smsFromAws] send sms info err:%j, data:%j',
          err,
          data
        );
        resolve(code);
      });
    });
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
