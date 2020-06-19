'use strict';

exports.detectErrorMessage = function(ctx, err) {
  // detect json parse error
  if (err.status === 400 &&
      err.name === 'SyntaxError' &&
      ctx.request.is('application/json', 'application/vnd.api+json', 'application/csp-report')) {
    return 'Problems parsing JSON';
  }
  return err.message;
};

exports.detectStatus = function(err) {
  // detect status
  let status = err.status || 500;
  if (status < 200) {
    // invalid status consider as 500, like urllib will return -1 status
    status = 500;
  }
  return status;
};

exports.accepts = function(ctx) {
  if (ctx.acceptJSON) return 'json';
  if (ctx.acceptJSONP) return 'js';
  return 'html';
};

exports.isProd = function(app) {
  return app.config.env !== 'local' && app.config.env !== 'unittest';
};
