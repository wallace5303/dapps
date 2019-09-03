'use strict';
const util = require('util');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

exports = module.exports;

// control variable of func "myPrint"
const isPrintFlag = true;

/**
 * Check and invoke callback function
 */
exports.invokeCallback = function(cb) {
  if (!!cb && typeof cb === 'function') {
    cb.apply(null, Array.prototype.slice.call(arguments, 1));
  }
};

exports.size = function(obj) {
  if (!obj) {
    return 0;
  }

  let size = 0;
  for (const f in obj) {
    if (obj.hasOwnProperty(f)) {
      size++;
    }
  }

  return size;
};

// print the file name and the line number ~ begin
function getStack() {
  const orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack) {
    return stack;
  };
  const err = new Error();
  Error.captureStackTrace(err, arguments.callee);
  const stack = err.stack;
  Error.prepareStackTrace = orig;
  return stack;
}

function getFileName(stack) {
  return stack[1].getFileName();
}

function getLineNumber(stack) {
  return stack[1].getLineNumber();
}

exports.myPrint = function() {
  if (isPrintFlag) {
    const len = arguments.length;
    if (len <= 0) {
      return;
    }
    const stack = getStack();
    let aimStr =
      "'" + getFileName(stack) + "' @" + getLineNumber(stack) + ' :\n';
    for (let i = 0; i < len; ++i) {
      aimStr +=
        (typeof arguments[i] === 'object'
          ? JSON.stringify(arguments[i])
          : arguments[i]) + ' ';
    }
    console.log('\n' + aimStr);
  }
};

exports.md5 = function(str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
};

/*
 * 加密
 */
exports.cipher = function(algorithm, key, iv, data) {
  key = new Buffer(key);
  iv = new Buffer(iv ? iv : 0);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  cipher.setAutoPadding(true); // default true
  let ciph = cipher.update(data, 'utf8', 'base64');
  ciph += cipher.final('base64');

  return ciph;
};

/*
 * 解密
 */
exports.decipher = function(algorithm, key, iv, crypted) {
  key = new Buffer(key);
  iv = new Buffer(iv ? iv : '');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAutoPadding(true);
  let decoded = decipher.update(crypted, 'base64', 'utf8');
  decoded += decipher.final('utf8');

  return decoded;
};

exports.getDate = function(flag) {
  if (!flag) {
    flag = '';
  }
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const mytimes = year + flag + month + flag + day;
  return mytimes;
};

exports.dynamicSign = function(len) {
  len = len || 5;
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const maxPos = chars.length;
  let sign = '';
  for (let i = 0; i < len; i++) {
    sign += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return sign;
};

exports.toHump = function(str) {
  let result = '';
  const split = str.split('_');
  result += split[0];
  for (let i = 1; i < split.length; ++i) {
    result += split[i][0].toUpperCase() + split[i].substr(1);
  }
  return result;
};

exports.tryJsonParse = function(jsonStr, cb) {
  try {
    cb(null, JSON.parse(jsonStr));
  } catch (e) {
    cb(e, null);
  }
};

exports.mkdir = function(dirpath, dirname) {
  // 判断是否是第一次调用
  if (typeof dirname === 'undefined') {
    if (fs.existsSync(dirpath)) {
      return;
    }
    this.mkdir(dirpath, path.dirname(dirpath));
  } else {
    // 判断第二个参数是否正常，避免调用时传入错误参数
    if (dirname !== path.dirname(dirpath)) {
      this.mkdir(dirpath);
      return;
    }
    if (fs.existsSync(dirname)) {
      fs.mkdirSync(dirpath);
    } else {
      this.mkdir(dirname, path.dirname(dirname));
      fs.mkdirSync(dirpath);
    }
  }

  console.log('==> dir end', dirpath);
};

/**
 * 获取目录下指定后缀的所有文件
 * @param dir
 * @param ext
 * @return {Array}
 */
exports.getAllFiles = function(dir, ext) {
  if (!dir) {
    return [];
  }

  const self = this;
  let extFiles = [];

  const files = fs.readdirSync(dir);
  files.forEach(function(file) {
    const pathname = path.join(dir, file);
    const stat = fs.lstatSync(pathname);

    if (stat.isDirectory()) {
      extFiles = extFiles.concat(self.getAllFiles(pathname, ext));
    } else if (path.extname(pathname) === ext) {
      extFiles.push(pathname.replace(cwd, '.'));
    }
  });

  return extFiles;
};

/**
 * 判断是否是同一天
 * @param d1
 * @param d2
 * @return {boolean}
 */
exports.isSameDay = function(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * 判断是否在有效期
 */
exports.isInDate = function(createDate, days) {
  const diffDays = this.diffDays(createDate) + 1;
  return diffDays <= days;
};

/**
 * differ days
 * 返回两个日期相隔的天数
 * 按0点算
 * 1日0点与2日0点相隔为1天
 */
exports.diffDays = function(createDate) {
  const tmp = new Date();
  tmp.setHours(0, 0, 0, 0);
  createDate.setHours(0, 0, 0, 0);
  return (tmp - createDate) / 24 / 3600000;
};

/**
 * differ weeks
 * 判断两个日期是否在同一周
 * add by mumu
 */
exports.isSameWeek = function(old, now) {
  const oneDayTime = 1000 * 60 * 60 * 24;
  const old_count = parseInt(old.getTime() / oneDayTime);
  const now_other = parseInt(now.getTime() / oneDayTime);
  return parseInt((old_count + 4) / 7) == parseInt((now_other + 4) / 7);
};

/**
 * 读取json文件并解析
 * @param path
 * @return {any}
 */
exports.loadJson = function(path) {
  return JSON.parse(fs.readFileSync(path).toString());
};

exports.getRandomArrayElements = function(arr, count) {
  let shuffled = arr.slice(0),
    i = arr.length,
    min = i - count,
    temp,
    index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
};

exports.getTodayExpireTime = function() {
  const endTime = new Date(new Date().setHours(23, 59, 59, 0)) / 1000;
  const expiresTime = endTime - Math.floor(new Date().getTime() / 1000);
  return expiresTime;
};

exports.objKeySort = function(obj) {
  const newkey = Object.keys(obj).sort();
  const newObj = {};
  for (let i = 0; i < newkey.length; i++) {
    newObj[newkey[i]] = obj[newkey[i]];
  }
  return newObj;
};

exports.serialize = function(obj) {
  const str = [];
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(p + '=' + obj[p]);
    }
  }
  return str.join('&');
};

exports.keepTwoDecimalFull = function(num) {
  let result = parseFloat(num);
  if (isNaN(result)) {
    return false;
  }
  result = Math.round(num * 100) / 100;
  let s_x = result.toString();
  let pos_decimal = s_x.indexOf('.');
  if (pos_decimal < 0) {
    pos_decimal = s_x.length;
    s_x += '.';
  }
  while (s_x.length <= pos_decimal + 2) {
    s_x += '0';
  }
  return s_x;
};

exports.sleep = function(time = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};
