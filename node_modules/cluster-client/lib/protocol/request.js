'use strict';

const utils = require('../utils');
const Packet = require('./packet');
const Constant = require('../const');

class Request extends Packet {
  constructor(options) {
    const id = utils.nextId();
    super(Object.assign({
      id,
      type: Constant.REQUEST,
    }, options));
  }
}

module.exports = Request;
