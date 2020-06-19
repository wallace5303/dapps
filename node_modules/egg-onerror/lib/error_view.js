'use strict';

// modify from https://github.com/poppinss/youch/blob/develop/src/Youch/index.js

const fs = require('fs');
const path = require('path');
const cookie = require('cookie');
const Mustache = require('mustache');
const stackTrace = require('stack-trace');
const util = require('util');

const { detectErrorMessage } = require('./utils');
const startingSlashRegex = /\\|\//;

class ErrorView {
  constructor(ctx, error, template) {
    this.codeContext = 5;
    this._filterHeaders = [ 'cookie', 'connection' ];

    this.ctx = ctx;
    this.error = error;
    this.request = ctx.request;
    this.app = ctx.app;
    this.assets = new Map();
    this.viewTemplate = template;
  }

  /**
   * get html error page
   *
   * @return {String} html page
   *
   * @memberOf ErrorView
   */
  toHTML() {
    const stack = this.parseError();
    const data = this.serializeData(stack, (frame, index) => {
      const serializedFrame = this.serializeFrame(frame);
      serializedFrame.classes = this.getFrameClasses(frame, index);
      return serializedFrame;
    });

    data.request = this.serializeRequest();
    data.appInfo = this.serializeAppInfo();

    return this.complieView(this.viewTemplate, data);
  }

  /**
   * compile view
   *
   * @param {String} tpl - template
   * @param {Object} locals - data used by template
   *
   * @return {String} html
   *
   * @memberOf ErrorView
   */
  complieView(tpl, locals) {
    return Mustache.render(tpl, locals);
  }

  /**
   * check if the frame is node native file.
   *
   * @param {Frame} frame - current frame
   * @return {Boolean} bool
   *
   * @memberOf ErrorView
   */
  isNode(frame) {
    if (frame.isNative()) {
      return true;
    }
    const filename = frame.getFileName() || '';
    return !path.isAbsolute(filename) && filename[0] !== '.';
  }

  /**
   * check if the frame is app modules.
   *
   * @param {Object} frame - current frame
   * @return {Boolean} bool
   *
   * @memberOf ErrorView
   */
  isApp(frame) {
    if (this.isNode(frame)) {
      return false;
    }
    const filename = frame.getFileName() || '';
    return !filename.includes('node_modules' + path.sep);
  }

  /**
   * cache file asserts
   *
   * @param {String} key - assert key
   * @param {String} value - assert content
   *
   * @memberOf ErrorView
   */
  setAssets(key, value) {
    this.assets.set(key, value);
  }

  /**
   * get cache file asserts
   *
   * @param {String} key - assert key
   *
   * @memberOf ErrorView
   */
  getAssets(key) {
    this.assets.get(key);
  }

  /**
   * get frame source
   *
   * @param {Object} frame - current frame
   * @return {Object} frame source
   *
   * @memberOf ErrorView
   */
  getFrameSource(frame) {
    const filename = frame.getFileName();
    const lineNumber = frame.getLineNumber();
    let contents = this.getAssets(filename);
    if (!contents) {
      contents = fs.readFileSync(filename, 'utf8');
      this.setAssets(filename, contents);
    }
    const lines = contents.split(/\r?\n/);

    return {
      pre: lines.slice(Math.max(0, lineNumber - (this.codeContext + 1)), lineNumber - 1),
      line: lines[lineNumber - 1],
      post: lines.slice(lineNumber, lineNumber + this.codeContext),
    };
  }

  /**
   * parse error and return frame stack
   *
   * @return {Array} frame
   *
   * @memberOf ErrorView
   */
  parseError() {
    const stack = stackTrace.parse(this.error);
    return stack.map(frame => {
      if (!this.isNode(frame)) {
        frame.context = this.getFrameSource(frame);
      }
      return frame;
    });
  }

  /**
   * get stack context
   *
   * @param {Object} frame - current frame
   * @return {Object} context
   *
   * @memberOf ErrorView
   */
  getContext(frame) {
    if (!frame.context) {
      return {};
    }

    return {
      start: frame.getLineNumber() - (frame.context.pre || []).length,
      pre: frame.context.pre.join('\n'),
      line: frame.context.line,
      post: frame.context.post.join('\n'),
    };
  }

  /**
   * get frame classes, let view identify the frame
   *
   * @param {any} frame - current frame
   * @param {any} index - current index
   * @return {String} classes
   *
   * @memberOf ErrorView
   */
  getFrameClasses(frame, index) {
    const classes = [];
    if (index === 0) {
      classes.push('active');
    }

    if (!this.isApp(frame)) {
      classes.push('native-frame');
    }

    return classes.join(' ');
  }

  /**
   * serialize frame and return meaningful data
   *
   * @param {Object} frame - current frame
   * @return {Object} frame result
   *
   * @memberOf ErrorView
   */
  serializeFrame(frame) {
    const filename = frame.getFileName();
    const relativeFileName = filename.includes(process.cwd())
      ? filename.replace(process.cwd(), '').replace(startingSlashRegex, '')
      : filename;
    const extname = path.extname(filename).replace('.', '');

    return {
      extname,
      file: relativeFileName,
      method: frame.getFunctionName(),
      line: frame.getLineNumber(),
      column: frame.getColumnNumber(),
      context: this.getContext(frame),
    };
  }

  /**
   * serialize base data
   *
   * @param {Object} stack - frame stack
   * @param {Function} frameFomatter - frame fomatter function
   * @return {Object} data
   *
   * @memberOf ErrorView
   */
  serializeData(stack, frameFomatter) {
    const code = this.error.code || this.error.type;
    let message = detectErrorMessage(this.ctx, this.error);
    if (code) {
      message = `${message} (code: ${code})`;
    }
    return {
      code,
      message,
      name: this.error.name,
      status: this.error.status,
      frames: stack instanceof Array ? stack.filter(frame => frame.getFileName()).map(frameFomatter) : [],
    };
  }

  /**
   * serialize request object
   *
   * @return {Object} request object
   *
   * @memberOf ErrorView
   */
  serializeRequest() {
    const headers = [];

    Object.keys(this.request.headers).forEach(key => {
      if (this._filterHeaders.includes(key)) {
        return;
      }
      headers.push({
        key,
        value: this.request.headers[key],
      });
    });

    const parsedCookies = cookie.parse(this.request.headers.cookie || '');
    const cookies = Object.keys(parsedCookies).map(key => {
      return { key, value: parsedCookies[key] };
    });

    return {
      url: this.request.url,
      httpVersion: this.request.httpVersion,
      method: this.request.method,
      connection: this.request.headers.connection,
      headers,
      cookies,
    };
  }

  /**
   * serialize app info object
   *
   * @return {Object} egg app info
   *
   * @memberOf ErrorView
   */
  serializeAppInfo() {
    return {
      baseDir: this.app.config.baseDir,
      config: util.inspect(this.app.config),
    };
  }
}

module.exports = ErrorView;
