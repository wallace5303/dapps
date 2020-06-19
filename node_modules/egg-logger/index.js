'use strict';

module.exports.Logger = require('./lib/logger');

module.exports.Transport = require('./lib/transports/transport');
module.exports.FileBufferTransport = require('./lib/transports/file_buffer');
module.exports.FileTransport = require('./lib/transports/file');
module.exports.ConsoleTransport = require('./lib/transports/console');

module.exports.EggLogger = require('./lib/egg/logger');
module.exports.EggErrorLogger = require('./lib/egg/error_logger');
module.exports.EggConsoleLogger = require('./lib/egg/console_logger');
module.exports.EggCustomLogger = require('./lib/egg/custom_logger');
module.exports.EggContextLogger = require('./lib/egg/context_logger');
module.exports.EggLoggers = require('./lib/egg/loggers');

module.exports.levels = require('./lib/level');
Object.assign(module.exports, module.exports.levels);
