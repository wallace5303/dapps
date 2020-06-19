'use strict';

const Packet = require('./packet');
const Constant = require('../const');

class Response extends Packet {
  constructor(options) {
    super(Object.assign({
      type: Constant.RESPONSE,
    }, options));
  }
}

module.exports = Response;
