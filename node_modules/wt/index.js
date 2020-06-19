'use strict';

var debug = require('debug')('wt');
var path = require('path');
var fs = require('fs');
var Base = require('sdk-base');
var util = require('util');
var ndir = require('ndir');

module.exports = Watcher;
module.exports.Watcher = Watcher;

/**
 * Watcher
 *
 * @param {Object} options
 *  - {Boolean} [ignoreNodeModules] ignore node_modules or not, default is `true`
 *  - {Boolean} [ignoreHidden] ignore hidden file or not, default is `true`
 *  - {Number} [rewatchInterval] auto rewatch root dir interval,
 *  	default is `0`, don't rewatch.
 * @param {Function} [done], watch all dirs done callback.
 */
function Watcher(options) {
  Base.call(this);
  // http://nodejs.org/dist/v0.11.12/docs/api/fs.html#fs_caveats
  // The recursive option is currently supported on OS X.
  // Only FSEvents supports this type of file watching
  // so it is unlikely any additional platforms will be added soon.

  options = options || {};
  if (options.ignoreHidden === undefined || options.ignoreHidden === null) {
    options.ignoreHidden = true;
  }
  if (options.ignoreNodeModules === undefined || options.ignoreNodeModules === null){
    options.ignoreNodeModules = true;
  }
  this._ignoreHidden = !!options.ignoreHidden;
  this._ignoreNodeModules = !!options.ignoreNodeModules;
  this._rewatchInterval = options.rewatchInterval;

  this.watchOptions = {
    persistent: true,
    recursive: false, // so we dont use this features
  };

  this._watchers = {};
  this._rootDirs = [];
  this._rewatchTimer = null;
  if (this._rewatchInterval && typeof this._rewatchInterval === 'number') {
    this._rewatchTimer = setInterval(this._rewatchRootDirs.bind(this), this._rewatchInterval);
    debug('start rewatch timer every %dms', this._rewatchInterval);
  }
}

Watcher.watch = function (dirs, options, done) {
  // watch(dirs, done);
  if (typeof options === 'function') {
    done = options;
    options = null;
  }

  var watcher = new Watcher(options).watch(dirs);
  if (typeof done === 'function') {
    var count = Array.isArray(dirs) ? dirs.length : 1;
    watcher.on('watch', function () {
      count--;
      if (count === 0) {
        done();
      }
    });
  }
  return watcher;
};

util.inherits(Watcher, Base);

var proto = Watcher.prototype;

proto.isWatching = function (dir) {
  return !!this._watchers[dir];
};

/**
 * Start watch dir(s)
 *
 * @param  {Array|String} dirs: dir path or path list
 * @return {this}
 */
proto.watch = function (dirs) {
  if (!Array.isArray(dirs)) {
    dirs = [dirs];
  }
  debug('watch(%j)', dirs);
  for (var i = 0; i < dirs.length; i++) {
    var dir = dirs[i];
    this._watchDir(dir);
    if (this._rootDirs.indexOf(dir) === -1) {
      this._rootDirs.push(dir);
    }
  }
  return this;
};

proto.unwatch = function (dirs) {
  if (!Array.isArray(dirs)) {
    dirs = [dirs];
  }

  for (var i = 0; i < dirs.length; i++) {
    var dir = dirs[i];
    this._unwatchDir(dir);
    if (this._rootDirs.indexOf(dir) !== -1) {
      // remove from root dirs
      this._rootDirs.splice(this._rootDirs.indexOf(dir), 1);
    }
  }
  return this;
};

proto.close = function () {
  for (var k in this._watchers) {
    this._watchers[k].close();
    this._watchers[k].removeAllListeners();
    this._watchers[k] = null;
  }
  this._watchers = {};

  // 等待一个事件循环后再移除所有时间，确保 watcher 的 error 事件还能被捕获
  setImmediate(function () {
    this.removeAllListeners();
  }.bind(this));
  if (this._rewatchTimer) {
    clearInterval(this._rewatchTimer);
    this._rewatchTimer = null;
  }
};

proto._rewatchRootDirs = function () {
  for (var i = 0; i < this._rootDirs.length; i++) {
    var dir = this._rootDirs[i];
    // watcher missing, meaning dir was deleted
    // try to rewatch again
    this._watchDirIfExists(dir);
  }
};

proto._watchDirIfExists = function (dir) {
  var that = this;
  fs.stat(dir, function (err, stat) {
    debug('[watchDirIfExists] %s, error: %s, exists: %s', dir, err, !!stat);
    if (stat && stat.isDirectory()) {
      if (!that._watchers[dir]) {
        // watch again!
        that._watchDir(dir);
      }
    } else if (!stat) {
      // not exists, close watcher
      that._unwatchDir(dir);
    }
  });
};

proto._watchDir = function (dir) {
  var watchers = this._watchers;
  var that = this;
  debug('walking %s...', dir);
  ndir.walk(dir).on('dir', function (dirpath) {
    if (path.basename(dirpath)[0] === '.' && that._ignoreHidden) {
      debug('ignore hidden dir: %s', dirpath);
      return;
    }
    if (path.basename(dirpath) === 'node_modules' && that._ignoreNodeModules){
      debug('ignore node_modules dir: %s', dirpath);
      return;
    }
    if (watchers[dirpath]) {
      debug('%s exists', dirpath);
      return;
    }
    debug('fs.watch(%s) start...', dirpath);
    var watcher;
    try {
      watcher = fs.watch(dirpath, that.watchOptions, that._handle.bind(that, dirpath));
    } catch (err) {
      err.dir = dirpath;
      that.emit('error', err);
      return;
    }
    watchers[dirpath] = watcher;
    watcher.once('error', that._onWatcherError.bind(that, dirpath));
  }).on('error', function (err) {
    err.dir = dir;
    that.emit('error', err);
  }).on('end', function () {
    debug('_watchDir(%s) done', dir);
    // debug('now watching %s', Object.keys(that._watchers));
    that.emit('watch', dir);
  });
  return this;
};

proto._unwatchDir = function (dir) {
  var watcher = this._watchers[dir];
  debug('unwatch %s, watcher exists: %s', dir, !!watcher);
  if (watcher) {
    watcher.close();
    watcher.removeAllListeners();
    delete this._watchers[dir];
    this.emit('unwatch', dir);
  }
  // should close all subdir watchers too
  var subdirs = Object.keys(this._watchers);
  for (var i = 0; i < subdirs.length; i++) {
    var subdir = subdirs[i];
    if (subdir.indexOf(dir + '/') === 0) {
      // close subdir watcher
      watcher = this._watchers[subdir];
      watcher.close();
      watcher.removeAllListeners();
      delete this._watchers[subdir];
      debug('close subdir %s watcher by %s', subdir, dir);
    }
  }
};

proto._onWatcherError = function (dir, err) {
  this._unwatchDir(dir);
  err.dir = dir;
  this.emit('error', err);
};

proto._handle = function (root, event, name) {
  var that = this;
  if (!name) {
    debug('[WARNING] event:%j, name:%j not exists on %s', root);
    return;
  }
  if (name[0] === '.' && this._ignoreHidden) {
    debug('ignore %s on %s/%s', event, root, name);
    return;
  }
  if (name === 'node_modules' && this._ignoreNodeModules) {
    debug('ignore %s on %s/%s', event, root, name);
    return;
  }
  // check root stat
  fs.exists(root, function (exists) {
    if (!exists) {
      debug('[handle] %s %s on %s, root not exists', event, name, root);
      that._handleChange({
        event: event,
        path: path.join(root, name),
        stat: null,
        remove: true,
        isDirectory: false,
        isFile: false,
      });

      // linux event, dir self remove, will fire `rename with dir name itself`
      if (that._watchers[root]) {
        debug('[handle] fire root:%s %s by %s', root, event, name);
        that._handleChange({
          event: event,
          path: root,
          stat: null,
          remove: true,
          isDirectory: true,
          isFile: false,
        });
      }
      return;
    }

    // children change
    debug('[handle] %s %s on %s, root exists', event, name, root);
    var fullpath = path.join(root, name);
    fs.stat(fullpath, function (err, stat) {
      var info = {
        event: event,
        path: fullpath,
        stat: stat,
        remove: false,
        isDirectory: stat && stat.isDirectory() || false,
        isFile: stat && stat.isFile() || false,
      };
      if (err) {
        if (err.code === 'ENOENT') {
          info.remove = true;
        }
      }

      if (event === 'change' && info.remove) {
        // this should be a fs.watch bug
        debug('[WARNING] %s on %s, but file not exists, ignore this', event, fullpath);
        return;
      }
      that._handleChange(info);
    });
  });
};

proto._handleChange = function (info) {
  debug('_handleChange(%j)', info);
  var that = this;
  if (info.remove) {
    var watcher = that._watchers[info.path];
    if (watcher) {
      // close the exists watcher
      info.isDirectory = true;
      that._unwatchDir(info.path);
    }
  } else if (info.isDirectory) {
    var watcher = that._watchers[info.path];
    if (!watcher) {
      // add new watcher
      that._watchDir(info.path);
    }
  }
  that.emit('all', info);
  if (info.remove) {
    debug('[remove event] %s, isDirectory: %s', info.path, info.isDirectory);
    that.emit('remove', info);
  } else if (info.isFile) {
    debug('[file change event] %s', info.path);
    that.emit('file', info);
  } else if (info.isDirectory) {
    debug('[dir change envet] %s', info.path);
    that.emit('dir', info);
  }
};
