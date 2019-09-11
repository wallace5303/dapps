'use strict';

const BaseService = require('./base');
const crypto = require('crypto');
const commonConfig = require('../config/commonConfig');
const utilsIndex = require('../utils/index');
const moment = require('moment');
const _ = require('lodash');

class UserService extends BaseService {}

module.exports = UserService;
