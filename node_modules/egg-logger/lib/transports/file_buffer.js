'use strict';

const depd = require('depd')('egg-logger');
const FileTransport = require('./file');
const utils = require('../utils');

/**
 * extends from {@link FileTransport}
 * save log in memory and flush to log file at intervals
 */
class FileBufferTransport extends FileTransport {

  /**
   * @constructor
   * @param {Object} options
   * - {String} file - log file path
   * - {Number} [flushInterval = 1000] - interval for flush to file
   * - {Number} [maxBufferLength = 1000] - max buffer queue length
   * - {String} [level = INFO] - log level
   */
  constructor(options) {
    super(options);

    this._bufSize = 0;
    this._buf = [];
    this._timer = this._createInterval();
  }

  get defaults() {
    return utils.assign(super.defaults, {
      flushInterval: 1000,
      maxBufferLength: 1000,
    });
  }

  /**
   * close stream and interval
   */
  close() {
    this._closeInterval();
    super.close();
  }

  /**
   * @deprecated
   */
  end() {
    depd('transport.end() is deprecated, use transport.close()');
    this.close();
  }

  /**
   * flush log into file
   */
  flush() {
    if (this._buf.length > 0 && this.writable) {
      if (this.options.encoding === 'utf8') {
        this._stream.write(this._buf.join(''));
      } else {
        this._stream.write(Buffer.concat(this._buf, this._bufSize));
      }
      this._buf = [];
      this._bufSize = 0;
    }
  }

  /**
   * override, flush before close stream
   * @private
   */
  _closeStream() {
    // FileTransport 在初始化时会 reload，这时 _buf 还未初始化
    if (this._buf && this._buf.length > 0) {
      this.flush();
    }
    super._closeStream();
  }

  /**
   * override, save in memory temporary
   * @param {Buffer} buf - log buffer
   * @private
   */
  _write(buf) {
    this._bufSize += buf.length;
    this._buf.push(buf);
    if (this._buf.length > this.options.maxBufferLength) {
      this.flush();
    }
  }

  /**
   * create interval to flush log into file
   * @return {Interval} 定时器
   * @private
   */
  _createInterval() {
    return setInterval(() => this.flush(), this.options.flushInterval);
  }

  /**
   * close interval
   * @private
   */
  _closeInterval() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
}

module.exports = FileBufferTransport;
