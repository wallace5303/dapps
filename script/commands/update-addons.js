'use strict';

const path = require('path');
const utils = require('../utils.js');
const shell = require('shelljs');
const _ = require('underscore');

let root;

const wget = utils.wget;
const fileExist = utils.fileExist;

async function run(app, argv) {
  root = process.cwd();

  if (!shell.which('node') || !shell.which('npm')) {
    app.logger.error(
      '[script] [commands] [update-addons] [run] 需要配置 node 和 npm 环境'
    );
    return false;
  }
  const nodeVersion = shell.exec('node -v', { silent: true }).substr(1);

  if (!utils.compareVersion('7.6', nodeVersion)) {
    app.logger.error(
      '[script] [commands] [update-addons] [run] node 需要 7.6 或以上版本'
    );
    return false;
  }

  const appid = argv.appid;
  const downloadType = 'github';

  const appPath = path.resolve(root, 'docker/addons/' + appid);
  app.logger.info(
    '[script] [commands] [update-addons] [run] 开始下载平台文件压缩包...'
  );
  await wget(appPath, appid, downloadType);
  app.logger.info('[script] [commands] [update-addons] [run] 下载完成');
  app.logger.info(
    '[script] [commands] [update-addons] [run] 开始docker安装...'
  );
  shell.cd(appPath);
  if (!shell.which('docker-compose')) {
    app.logger.info(
      '[script] [commands] [update-addons] [run] 需要配置docker-compose 环境'
    );
  }
  const dockerRes = shell.exec('docker-compose up -d ' + appid, {
    silent: false,
  });
  app.logger.info(
    '[script] [commands] [update-addons] [run] dockerRes:',
    dockerRes
  );
  app.logger.info(
    '[script] [commands] [update-addons] [run] dockerRes.code:',
    dockerRes.code
  );
}

module.exports = {
  setOptions(yargs) {
    yargs.option('v', {
      alias: 'v',
      describe: '部署版本',
    });
  },
  run(app, argv) {
    const result = run(app, argv);
    result
      .then(function() {
        app.logger.info('[script] [commands] [update-addons] [run] success!');
        return true;
      })
      .catch(function(err) {
        app.logger.info('[script] [commands] [update-addons] [run] failed!');
        return false;
      });
  },
  desc: '更新应用插件',
};
