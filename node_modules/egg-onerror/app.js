'use strict';

const http = require('http');
const fs = require('fs');
const onerror = require('koa-onerror');
const ErrorView = require('./lib/error_view');
const {
  isProd,
  detectStatus,
  detectErrorMessage,
  accepts,
} = require('./lib/utils');

module.exports = app => {
  // logging error
  const config = app.config.onerror;
  const viewTemplate = fs.readFileSync(config.templatePath, 'utf8');

  app.on('error', (err, ctx) => {
    ctx = ctx || app.createAnonymousContext();
    if (config.appErrorFilter && !config.appErrorFilter(err, ctx)) return;

    const status = detectStatus(err);
    // 5xx
    if (status >= 500) {
      try {
        ctx.logger.error(err);
      } catch (ex) {
        app.logger.error(err);
        app.logger.error(ex);
      }
      return;
    }

    // 4xx
    try {
      ctx.logger.warn(err);
    } catch (ex) {
      app.logger.warn(err);
      app.logger.error(ex);
    }
  });

  const errorOptions = {
    // support customize accepts function
    accepts() {
      const fn = config.accepts || accepts;
      return fn(this);
    },

    html(err) {
      const status = detectStatus(err);
      const errorPageUrl = typeof config.errorPageUrl === 'function'
        ? config.errorPageUrl(err, this)
        : config.errorPageUrl;

      // keep the real response status
      this.realStatus = status;
      // don't respond any error message in production env
      if (isProd(app)) {
        // 5xx
        if (status >= 500) {
          if (errorPageUrl) {
            const statusQuery =
              (errorPageUrl.indexOf('?') > 0 ? '&' : '?') +
              `real_status=${status}`;
            return this.redirect(errorPageUrl + statusQuery);
          }
          this.status = 500;
          this.body = `<h2>Internal Server Error, real status: ${status}</h2>`;
          return;
        }
        // 4xx
        this.status = status;
        this.body = `<h2>${status} ${http.STATUS_CODES[status]}</h2>`;
        return;
      }
      // show simple error format for unittest
      if (app.config.env === 'unittest') {
        this.status = status;
        this.body = `${err.name}: ${err.message}\n${err.stack}`;
        return;
      }

      const errorView = new ErrorView(this, err, viewTemplate);
      this.body = errorView.toHTML();
    },

    json(err) {
      const status = detectStatus(err);
      let errorJson = {};

      this.status = status;
      const code = err.code || err.type;
      const message = detectErrorMessage(this, err);

      if (isProd(app)) {
        // 5xx server side error
        if (status >= 500) {
          errorJson = {
            code,
            // don't respond any error message in production env
            message: http.STATUS_CODES[status],
          };
        } else {
          // 4xx client side error
          // addition `errors`
          errorJson = {
            code,
            message,
            errors: err.errors,
          };
        }
      } else {
        errorJson = {
          code,
          message,
          errors: err.errors,
        };

        if (status >= 500) {
          // provide detail error stack in local env
          errorJson.stack = err.stack;
          errorJson.name = err.name;
          for (const key in err) {
            if (!errorJson[key]) {
              errorJson[key] = err[key];
            }
          }
        }
      }

      this.body = errorJson;
    },

    js(err) {
      errorOptions.json.call(this, err, this);

      if (this.createJsonpBody) {
        this.createJsonpBody(this.body);
      }
    },
  };

  // support customize error response
  [ 'all', 'html', 'json', 'text', 'js' ].forEach(type => {
    if (config[type]) errorOptions[type] = config[type];
  });
  onerror(app, errorOptions);
};
