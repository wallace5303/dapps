'use strict';

module.exports = app => {
  app.view.use('ejs', require('./lib/view'));
};
