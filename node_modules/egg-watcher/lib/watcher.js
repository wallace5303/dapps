'use strict';

const Base = require('sdk-base');
const utils = require('./utils');
const camelcase = require('camelcase');

module.exports = class Watcher extends Base {
  constructor(config) {
    super();

    const options = config.watcher;

    let EventSource = options.eventSources[options.type];
    if (typeof EventSource === 'string') {
      EventSource = require(EventSource);
    }

    // chokidar => watcherChokidar
    // custom => watcherCustom
    const key = camelcase([ 'watcher', options.type ]);
    const eventSourceOpts = config[key];
    this._eventSource = new EventSource(eventSourceOpts)
      .on('change', this._onChange.bind(this))
      .on('fuzzy-change', this._onFuzzyChange.bind(this))
      .on('info', (...args) => this.emit('info', ...args))
      .on('warn', (...args) => this.emit('warn', ...args))
      .on('error', (...args) => this.emit('error', ...args));

    this._eventSource.ready(() => this.ready(true));
  }

  watch(path, callback) {
    this.emit('info', '[egg-watcher] Start watching: %j', path);
    if (!path) return;

    // support array
    if (Array.isArray(path)) {
      path.forEach(p => this.watch(p, callback));
      return;
    }

    // one file only watch once
    if (!this.listenerCount(path)) this._eventSource.watch(path);
    this.on(path, callback);
  }

  /*
  // TODO wait unsubscribe implementation of cluster-client
  unwatch(path, callback) {
    if (!path) return;

    // support array
    if (Array.isArray(path)) {
      path.forEach(p => this.unwatch(p, callback));
      return;
    }

    if (callback) {
      this.removeListener(path, callback);
      // stop watching when no listener bound to the path
      if (this.listenerCount(path) === 0) {
        this._eventSource.unwatch(path);
      }
      return;
    }

    this.removeAllListeners(path);
    this._eventSource.unwatch(path);
  }
  */

  _onChange(info) {
    this.emit('info', '[egg-watcher] Received a change event from eventSource: %j', info);
    const path = info.path;

    for (const p in this._events) {
      // if it is a sub path, emit a `change` event
      if (utils.isEqualOrParentPath(p, path)) {
        this.emit(p, info);
      }
    }
  }

  _onFuzzyChange(info) {
    this.emit('info', '[egg-watcher] Received a fuzzy-change event from eventSource: %j', info);
    const path = info.path;

    for (const p in this._events) {
      // if it is a parent path, emit a `change` event
      // just the oppsite to `_onChange`
      if (utils.isEqualOrParentPath(path, p)) {
        this.emit(p, info);
      }
    }
  }

};
