'use strict';

const JSONEncoder = require('./encoder');
const JSONDecoder = require('./decoder');

const encoder = new JSONEncoder();
const decoder = new JSONDecoder();

exports.encode = json => {
  return encoder.encode(json);
};

exports.decode = buf => {
  return decoder.decode(buf);
};
