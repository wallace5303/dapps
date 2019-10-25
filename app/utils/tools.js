'use strict';
const download = require('download');
const fs = require('fs');

function oldVersion() {
  return [];
}

function github(appid, type = 'github') {
  let url;

  if (type === 'github') {
    url =
      'https://github.com/wallace5303/dapps-addons/raw/master/zip/' +
      appid +
      '.zip';
  } else {
    url = 'https://kaka996.coding.net/p/zip/git/raw/master/' + appid + '.zip';
  }
  return url;
}
module.exports = {
  message: {
    fount_project_path_error:
      '项目目录找不到配置文件 config.json, 请确认当前目录是否为项目目录',
  },

  log(msg) {
    console.log(msg);
  },
  error(error) {
    console.error(error);
  },
  async wget(dest, appid, type) {
    const url = github(appid, type);
    console.log('下载路径：%j', url);
    const cmd = await download(url, dest, { extract: true, strip: 1 });
    cmd.stdout = process.stdout;
    return cmd;
  },
  fileExist(filePath) {
    try {
      return fs.statSync(filePath).isFile();
    } catch (err) {
      return false;
    }
  },
  compareVersion: function compareVersion(version, bigVersion) {
    version = version.split('.');
    bigVersion = bigVersion.split('.');
    for (let i = 0; i < version.length; i++) {
      version[i] = +version[i];
      bigVersion[i] = +bigVersion[i];
      if (version[i] > bigVersion[i]) {
        return false;
      } else if (version[i] < bigVersion[i]) {
        return true;
      }
    }
    return true;
  },
  handleVersion(version) {
    if (!version) return version;
    version = version + '';
    if (version[0] === 'v') {
      return version.substr(1);
    }
    return version;
  },
};
