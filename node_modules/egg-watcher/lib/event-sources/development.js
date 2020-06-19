'use strict';

const Wt = require('wt');
const fs = require('fs');
const Base = require('sdk-base');

// only used by local dev enviroment
class DevelopmentEventSource extends Base {

  constructor() {
    super();

    this.wt = new Wt({
      // check if the under-watch directory is still alive every minute
      rewatchInterval: 60000,
    })
      .on('all', (...args) => this._onWtChange(...args))
      .on('error', (...args) => this.emit('error', ...args));

    this._fileWatching = new Map();
    this.ready(true);
  }

  watch(path) {
    try {
      const stat = fs.statSync(path);
      if (stat.isFile(path)) {
        const handler = fs.watch(path, this._onFsWatchChange.bind(this, path));
        // 保存 handler，用于接触监听
        this._fileWatching.set(path, handler);
      } else if (stat.isDirectory()) {
        this.wt.watch(path);
      }
    } catch (e) {
      // file not exist, do nothing
      // do not emit error, in case of too many logs
    }
  }

  unwatch(path) {
    if (!path) return;

    const h = this._fileWatching.get(path);
    if (h) {
      // fs.watch 文件监听
      h.removeAllListeners();
      h.close();
      this._fileWatching.delete(path);
    } else {
      // wt 文件夹监听
      this.wt.unwatch(path);
    }
  }

  _onWtChange(info) {
    // debug('got %s, info %j', info.event, info);
    // { event: 'change',
    // path: '/Users/mk2/git/changing/test/fixtures/foo.js',
    // stat:
    //  { dev: 16777220,
    //    mode: 33188,
    //    nlink: 1,
    //    uid: 501,
    //    gid: 20,
    //    rdev: 0,
    //    blksize: 4096,
    //    ino: 72656587,
    //    size: 11,
    //    blocks: 8,
    //    atime: Wed Jun 17 2015 00:08:11 GMT+0800 (CST),
    //    mtime: Wed Jun 17 2015 00:08:38 GMT+0800 (CST),
    //    ctime: Wed Jun 17 2015 00:08:38 GMT+0800 (CST),
    //    birthtime: Tue Jun 16 2015 23:19:13 GMT+0800 (CST) } }

    this.emit('change', info);
  }

  _onFsWatchChange(path, event) {
    const info = {
      path,
      event,
      stat: fs.statSync(path),
    };
    // this.emit(info.event, info);
    this.emit('change', info);
  }
}

module.exports = DevelopmentEventSource;
