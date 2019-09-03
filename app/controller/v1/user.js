'use strict';

const BaseController = require('../base');
const _ = require('lodash');
const validateRules = require('../../utils/validataRules');
const commonConfig = require('../../config/commonConfig');

class UserController extends BaseController {
  /*
   * 用户信息
   */
  async info() {
    const self = this;
    const { app, ctx, service } = this;
    const userInfo = ctx.userInfo;


    self.sendSuccess({}, '');
  }


}

module.exports = UserController;
