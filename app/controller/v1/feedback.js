'use strict';

const BaseController = require('../base');

class FeedbackController extends BaseController {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }
}

module.exports = FeedbackController;
