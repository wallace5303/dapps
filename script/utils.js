'use strict';
const download = require('download');
const fs = require('fs');
const semver = require('semver');
const axios = require('axios');

function oldVersion() {
  return [];
}

function github(appid, type = 'github') {
  let url;

  if (type === 'github') {
    url =
      'https://raw.githubusercontent.com/wallace5303/dapps-addons/master/zip/' +
      appid +
      '.zip';
  } else {
    // url = 'http://yapi.demo.qunar.com/publicapi/archive/' + appid;
  }
  return url;
}
module.exports = {
  message: {
    fount_project_path_error:
      '项目目录找不到配置文件 config.json, 请确认当前目录是否为项目目录',
  },

  async getVersions() {
    const info = await axios.get(
      'https://www.easy-mock.com/mock/5c2851e3d84c733cb500c3b9/yapi/versions'
    );
    const versions = info.data.data;
    console.log(versions);
    return [].concat(versions, oldVersion());
  },

  log(msg) {
    console.log(msg);
  },
  error(error) {
    console.error(error);
  },
  wget(dest, appid, type) {
    const url = github(appid, type);
    const cmd = download(url, dest, { extract: true, strip: 1 });
    console.log(url);
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
