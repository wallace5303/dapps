'use strict';

const is = require('is-type-of');

module.exports = function show(obj) {
  const type = {}.toString.call(obj).replace(/^\[object (.*)\]$/, '$1');
  if (is.buffer(obj)) obj = obj.toString();
  // escape \n to \\n for good view in terminal
  if (is.string(obj)) obj = obj.replace(/\n/g, '\\n');
  // stringify if object
  if (!is.regexp(obj) && is.object(obj)) obj = JSON.stringify(obj);
  return `${obj}(${type})`;
};
