'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs');
const escapeHtml = require('escape-html');
const sendToWormhole = require('stream-wormhole');

const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';
const templatePath = isDev
  ? path.join(__dirname, 'templates/dev_error.html')
  : path.join(__dirname, 'templates/prod_error.html');
const defaultTemplate = fs.readFileSync(templatePath, 'utf8');

const defaultOptions = {
  text,
  json,
  html,
  redirect: null,
  template: path.join(__dirname, 'error.html'),
  accepts: null,
};

module.exports = function onerror(app, options) {
  options = Object.assign({}, defaultOptions, options);

  app.context.onerror = function(err) {
    // don't do anything if there is no error.
    // this allows you to pass `this.onerror`
    // to node-style callbacks.
    if (err == null) return;

    // ignore all pedding request stream
    if (this.req) sendToWormhole(this.req);

    // wrap non-error object
    if (!(err instanceof Error)) {
      const newError = new Error('non-error thrown: ' + err);
      // err maybe an object, try to copy the name, message and stack to the new error instance
      if (err) {
        if (err.name) newError.name = err.name;
        if (err.message) newError.message = err.message;
        if (err.stack) newError.stack = err.stack;
        if (err.status) newError.status = err.status;
        if (err.headers) newError.headers = err.headers;
      }
      err = newError;
    }

    const headerSent = this.headerSent || !this.writable;
    if (headerSent) err.headerSent = true;

    // delegate
    this.app.emit('error', err, this);

    // nothing we can do here other
    // than delegate to the app-level
    // handler and log.
    if (headerSent) return;

    // ENOENT support
    if (err.code === 'ENOENT') err.status = 404;

    if (typeof err.status !== 'number' || !http.STATUS_CODES[err.status]) {
      err.status = 500;
    }
    this.status = err.status;

    this.set(err.headers);
    let type = 'text';
    if (options.accepts) {
      type = options.accepts.call(this, 'html', 'text', 'json');
    } else {
      type = this.accepts('html', 'text', 'json');
    }
    type = type || 'text';
    if (options.all) {
      options.all.call(this, err, this);
    } else {
      if (options.redirect && type !== 'json') {
        this.redirect(options.redirect);
      } else {
        options[type].call(this, err, this);
        this.type = type;
      }
    }

    if (type === 'json') {
      this.body = JSON.stringify(this.body);
    }
    this.res.end(this.body);
  };

  return app;
};

/**
 * default text error handler
 * @param {Error} err
 */

function text(err, ctx) {
  // unset all headers, and set those specified
  ctx.res._headers = {};
  ctx.set(err.headers);

  ctx.body = (isDev || err.expose) && err.message
    ? err.message
    : http.STATUS_CODES[this.status];
}

/**
 * default json error handler
 * @param {Error} err
 */

function json(err, ctx) {
  const message = (isDev || err.expose) && err.message
    ? err.message
    : http.STATUS_CODES[this.status];

  ctx.body = { error: message };
}

/**
 * default html error handler
 * @param {Error} err
 */

function html(err, ctx) {
  ctx.body = defaultTemplate
    .replace('{{status}}', escapeHtml(err.status))
    .replace('{{stack}}', escapeHtml(err.stack));
  ctx.type = 'html';
}
