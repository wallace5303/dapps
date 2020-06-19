'use strict';

module.exports = require('./app/middleware/securities');
module.exports.csp = require('./lib/middlewares/csp');
module.exports.csrf = require('./lib/middlewares/csrf');
module.exports.methodNoAllow = require('./lib/middlewares/methodnoallow');
module.exports.noopen = require('./lib/middlewares/noopen');
module.exports.nosniff = require('./lib/middlewares/nosniff');
module.exports.xssProtection = require('./lib/middlewares/xssProtection');
module.exports.xframe = require('./lib/middlewares/xframe');
module.exports.safeRedirect = require('./lib/safe_redirect');
module.exports.utils = require('./lib/utils');
