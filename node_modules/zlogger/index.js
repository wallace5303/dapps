'use strict';

const ChildProcess = require('child_process').ChildProcess;
const Console = require('console').Console;
const through = require('through2');
const split = require('split2');
const pumpify = require('pumpify');


const defaults = {
  stdout: process.stdout,
  stderr: process.stderr,
  prefix: '',
  time: true,
};

/**
 * log/debug/info -> this.stdout(pad) -> opt.stdout
 * warn/error -> this.stderr(pad) -> opt.stderr
 */
class Logger extends Console {

  constructor(options) {
    options = Object.assign({}, defaults, options);
    const stdout = padStream(() => this._getPrefix());
    const stderr = padStream(() => this._getPrefix());
    super(stdout, stderr);

    this.stdout = stdout;
    this.stderr = stderr;
    this.options = options;

    stdout.setMaxListeners(100);
    stderr.setMaxListeners(100);
    stdout.pipe(options.stdout);
    stderr.pipe(options.stderr);
  }

  child(obj, prefix) {
    // child('> ')
    if (typeof obj === 'string') {
      prefix = obj;
      obj = null;
    }

    // obj -> child.stdout/stderr(pad) -> this.stdout/stderr(pad) -> opt.stdout
    const child = new Logger({
      stdout: this.stdout,
      stderr: this.stderr,
      time: false,
      prefix: prefix || '',
    });

    if (obj) {
      if (obj instanceof ChildProcess) {
        obj.stdout.pipe(child.stdout, { end: false });
        obj.stderr.pipe(child.stderr, { end: false });
      } else if (obj.pipe) {
        obj.pipe(child.stdout, { end: false });
      }
    }

    return child;
  }

  end() {
    this.stdout.end();
    this.stderr.end();
  }

  _getPrefix() {
    let prefix = this.options.prefix;
    if (typeof prefix === 'function') {
      prefix = prefix();
    }
    if (!this.options.time) return prefix;
    const d = new Date();
    let hours = d.getHours();
    if (hours < 10) {
      hours = '0' + hours;
    }
    let mintues = d.getMinutes();
    if (mintues < 10) {
      mintues = '0' + mintues;
    }
    let seconds = d.getSeconds();
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return `[${hours}:${mintues}:${seconds}] ${prefix}`;
  }

}

module.exports = Logger;

function padStream(prefix) {
  return pumpify(split(), through(function(data, enc, cb) {
    this.push(prefix());
    this.push(data);
    this.push('\n');
    cb();
  }));
}
