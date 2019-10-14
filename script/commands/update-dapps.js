'use strict';

const utils = require('../utils.js');
const shell = require('shelljs');
const _ = require('underscore');
const commonConfig = require('../../app/config/commonConfig');
const download = require('download');

let root;

async function run() {
  root = process.cwd();

  if (!shell.which('node') || !shell.which('npm')) {
    console.log(
      '[script] [commands] [update-addons] [run] 需要配置 node 和 npm 环境'
    );
    return false;
  }
  const nodeVersion = shell.exec('node -v', { silent: true }).substr(1);

  if (!utils.compareVersion('7.6', nodeVersion)) {
    console.log(
      '[script] [commands] [update-addons] [run] node 需要 7.6 或以上版本'
    );
    return false;
  }

  const url = commonConfig.dappsPath.github;

  console.log('[script] [sysUpdate]  url:%j', url);
  const dest = root + '/test';
  console.log('[script] [sysUpdate]  dest:%j', dest);
  const cmd = await download(url, dest, { extract: true, strip: 1 });
  cmd.stdout = process.stdout;
  console.log(cmd.stdout);
  console.log('[script] [sysUpdate]  dapps 下载完成');
  console.log('[script] [sysUpdate]  dapps 请重启服务');
}

const result = run();
result
  .then(function() {
    console.log('[script] [commands] [update-dapps] [run] success!');
    return true;
  })
  .catch(function(err) {
    console.log('[script] [commands] [update-dapps] [run] failed!');
    return false;
  });
