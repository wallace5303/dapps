'use strict';

const ByteBuffer = require('byte');

// avoid create many buffer
module.exports = new ByteBuffer({
  size: 1024 * 1024,
});
