'use strict';

const LogRotator = require('../lib/rotator');

// egg-schedule will load both at app and agent, so we should mount it for compatiblecompatible
module.exports = {
  LogRotator,
};
