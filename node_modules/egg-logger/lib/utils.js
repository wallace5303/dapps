'use strict';

const os = require('os');
const util = require('util');
const chalk = require('chalk');
const utility = require('utility');
const iconv = require('iconv-lite');
const levels = require('./level');
const circularJSON = require('circular-json-for-egg');

const hostname = os.hostname();
const duartionRegexp = /([0-9]+ms)/g;
// eslint-disable-next-line no-useless-escape
const categoryRegexp = /(\[[\w\-_.:]+\])/g;
const httpMethodRegexp = /(GET|POST|PUT|PATH|HEAD|DELETE) /g;

/**
 * @class LoggerUtils
 */
module.exports = {

  normalizeLevel(level) {
    if (typeof level === 'number') {
      return level;
    }

    // 'WARN' => level.warn
    if (typeof level === 'string' && level) {
      return levels[level.toUpperCase()];
    }
  },

  // default format
  defaultFormatter(meta) {
    return meta.date + ' ' + meta.level + ' ' + meta.pid + ' ' + meta.message;
  },

  // output to Terminal format
  consoleFormatter(meta) {
    let msg = meta.date + ' ' + meta.level + ' ' + meta.pid + ' ' + meta.message;
    if (!chalk.supportsColor) {
      return msg;
    }

    if (meta.level === 'ERROR') {
      return chalk.red(msg);
    } else if (meta.level === 'WARN') {
      return chalk.yellow(msg);
    }

    msg = msg.replace(duartionRegexp, chalk.green('$1'));
    msg = msg.replace(categoryRegexp, chalk.blue('$1'));
    msg = msg.replace(httpMethodRegexp, chalk.cyan('$1 '));
    return msg;
  },

  /**
   * Get final formated log string buffer
   *
   * Invoke link: {@Link Logger#log} -> {@link Transport#log} -> LoggerUtils.format
   * @method LoggerUtils#format
   * @param {String} level - log level
   * @param {Array} args - format arguments
   * @param {Object} meta - loging behaviour meta infomation
   *  - {String} level
   *  - {Boolean} raw
   *  - {Function} formatter
   *  - {Error} error
   *  - {String} message
   *  - {Number} pid
   *  - {String} hostname
   *  - {String} date
   * @param {Object} options - {@link Transport}'s options
   *  - {String} encoding
   *  - {Boolean} json
   *  - {Function} formatter
   * @return {Buffer} formatted log string buffer
   */
  format(level, args, meta, options) {
    meta = meta || {};
    let message;
    let output;
    let formatter = meta.formatter || options.formatter;
    if (meta.ctx && options.contextFormatter) formatter = options.contextFormatter;

    if (args[0] instanceof Error) {
      message = formatError(args[0]);
    } else {
      message = util.format.apply(util, args);
    }

    if (meta.raw === true) {
      output = message;
    } else if (options.json === true || formatter) {
      meta.level = level;
      meta.date = utility.logDate(',');
      meta.pid = process.pid;
      meta.hostname = hostname;
      meta.message = message;
      output = options.json === true ? JSON.stringify(meta) : formatter(meta);
    } else {
      output = message;
    }

    if (!output) return new Buffer('');

    output += options.eol;

    // convert string to buffer when encoding is not utf8
    return options.encoding === 'utf8' ? output : iconv.encode(output, options.encoding);
  },

  // Like `Object.assign`, but don't copy `undefined` value
  assign(target) {
    if (!target) {
      return {};
    }
    const sources = Array.prototype.slice.call(arguments, 1);
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      if (!source) continue;
      const keys = Object.keys(source);
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        if (source[key] !== undefined && source[key] !== null) {
          target[key] = source[key];
        }
      }
    }
    return target;
  },

  formatError,
};

function formatError(err) {
  if (err.name === 'Error' && typeof err.code === 'string') {
    err.name = err.code + err.name;
  }

  if (err.host) {
    err.message += ` (${err.host})`;
  }

  // name and stack could not be change on node 0.11+
  const errStack = err.stack || 'no_stack';
  const errProperties = Object.keys(err).map(key => inspect(key, err[key])).join('\n');
  return util.format('nodejs.%s: %s\n%s\n%s\npid: %s\nhostname: %s\n',
    err.name,
    err.message,
    errStack.substring(errStack.indexOf('\n') + 1),
    errProperties,
    process.pid,
    hostname
  );
}

function inspect(key, value) {
  return `${key}: ${formatObject(value)}`;
}

function formatString(str) {
  if (str.length > 10000) {
    return `${str.substr(0, 10000)}...(${str.length})`;
  }
  return str;
}

function formatBuffer(buf) {
  const tail = buf.data.length > 50 ? ` ...(${buf.data.length}) ` : '';
  const bufStr = buf.data.slice(0, 50).map(i => {
    i = i.toString(16);
    if (i.length === 1) i = `0${i}`;
    return i;
  }).join(' ');
  return `<Buffer ${bufStr}${tail}>`;
}

function formatObject(obj) {
  try {
    return circularJSON.stringify(obj, (key, v) => {
      if (typeof v === 'string') return formatString(v);
      if (v && v.type === 'Buffer' && Array.isArray(v.data)) {
        return formatBuffer(v);
      }
      if (v instanceof RegExp) return util.inspect(v);
      return v;
    });
  } catch (_) {
    /* istanbul ignore next */
    return String(obj);
  }
}
