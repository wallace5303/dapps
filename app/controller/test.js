'use strict';

const BaseController = require('./base');
const _ = require('lodash');
const utils = require('../utils/utils');
const moment = require('moment');
const shell = require('shelljs');
const fs = require('fs');
const path = require('path');
const Keyv = require('keyv');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const download = require('download');

class TestController extends BaseController {
  async index() {
    const { app, ctx, service } = this;
    const query = ctx.request.query;
    console.log('env:%j', app.config.env);
    const res = 0;
    const root = process.cwd();
    const data = {
      env: app.config.env,
    };

    // const val = await service.lowdb.updateDapps('1.0.0');
    // console.log(val);
    // process.send({
    //   to: 'master',
    //   action: 'reload-worker',
    // });

    // const url = 'https://github.com/wallace5303/dapps/archive/master.zip';
    // const dest = this.app.baseDir + '/test';
    // const cmd = download(url, dest, { extract: true , strip: 1 });
    // cmd.stdout = process.stdout;
    // return cmd;

    // const val1 = await service.lowdb.getMyappByAppid('test3');
    // console.log(val1);

    // const val = await service.lowdb.removeMyapp('mongo');
    // if (val.length > 0) {
    //   console.log('ok');
    // } else {
    //   console.log('fal');
    // }

    // const val1 = await service.lowdb.getMyappList(0);
    // console.log(val1);

    // const val = await service.lowdb.createMyapp('test3');
    // console.log(val);
    // const list = await service.lowdb.getMyapp();
    // const newList = _.map(list, 'appid');
    // console.log(newList);

    // const num = await service.lowdb.getMyappNum();
    // console.log(num);

    // const val = await service.store.appContainerExist('mongo');
    // console.log(val);

    // service.lowdb.setMyInstallingApp('redis');

    // const val = await service.lowdb.getMyInstallingApp('redis');
    // console.log(val);
    // if (val) {
    //   console.log(111);
    // } else {
    //   console.log(222);
    // }

    // const file = this.app.baseDir + '/storage/db.json';
    // const adapter = new FileSync(file);
    // const db = low(adapter);

    // const value = db
    //   .get('posts')
    //   .find({ id: 1 })
    //   .value();
    // console.log(value);
    // db.defaults({ posts: [], user: {} }).write();

    // // Add a post
    // db.get('posts')
    //   .push({ id: 1, title: 'lowdb is awesome' })
    //   .write();

    // // Set a user using Lodash shorthand syntax
    // db.set('user.name', 'typicode').write();

    // const keyv = new Keyv();
    // keyv.on('error', err => console.log('Connection Error', err));

    // await keyv.set('foo', 'expires in 1 second', 30000); // true
    // const value = await keyv.get('foo');
    // console.log(value);

    // await keyv.set('foo', 'expires in 1 second', 10000); // true
    // await keyv.set('foo', 'never expires'); // true
    // await keyv.get('foo'); // 'never expires'
    // await keyv.delete('foo'); // true
    // await keyv.clear(); // undefined

    // const dirpath = this.app.baseDir + '/docker/addons/redis';
    // const file = dirpath + '/installing.lock';

    // service.store.appIsInstalling('rediss');

    // // fs.writeFileSync(file);
    // fs.chmodSync(utils.chmodPath, '777');

    // utils.chmodPath(dirpath, '777');
    // const dirpath = this.app.baseDir + '/docker/addons/redis';

    // const delRes = utils.delDir(dirpath);
    // console.log('delRes:%j', delRes);

    // const runRes = await service.store.appIsRunning('mongo');

    // const delFileRes = await this.service.store.delAppFile('redis');
    // if (!delFileRes) {
    //   res.msg = '删除应用文件失败';
    //   return res;
    // }

    // console.log('this.app.baseDir:%j', this.app.baseDir);

    // console.log('OS_PLATFORM ', OS_PLATFORM);
    // // const isWin = /^win/.test('win32');
    // console.log('IS_WIN ', IS_WIN);
    // console.log('DOCKER_COMPOE_FILE ', DOCKER_COMPOE_FILE);

    // const compareRes = utils.compareVersion('1.0.0', '1.10.0');
    // console.log('compareRes:%j', compareRes);
    // const file = path.resolve(root, 'docker/addons/redis/.env');
    // const arr = await utils.readFileToArr(file);
    // console.log(arr);
    // for (let i = 0; i < arr.length; i++) {
    //   const tmpEle = arr[i];
    //   if (tmpEle.indexOf('APP_VERSION') !== -1) {
    //     console.log(tmpEle.substr(12));
    //   }
    // }

    // JSON.parse();
    // console.log(this.app.config.baseDir);

    // if (!shell.which('node')) {
    //   shell.echo('Sorry, this script requires git');
    //   // shell.exit(1);
    // }

    // const nodeVersion = shell.exec('node -v', { silent: false });
    // console.log(nodeVersion);

    console.log('res:%j', res);
    this.sendSuccess(data, 'ok');
  }
}

module.exports = TestController;
