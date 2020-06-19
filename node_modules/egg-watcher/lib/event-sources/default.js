'use strict';

const Base = require('sdk-base');

class DefaultEventSource extends Base {

  constructor() {
    super();
    // delay emit so that can be listened
    setImmediate(() => this.emit('warn', '[egg-watcher] defaultEventSource watcher will NOT take effect'));
    this.ready(true);
  }

  watch() {
    this.emit('warn', '[egg-watcher] using defaultEventSource watcher.watch() does NOTHING');
  }

  unwatch() {
    this.emit('warn', '[egg-watcher] using defaultEventSource watcher.unwatch() does NOTHING');
  }

}

module.exports = DefaultEventSource;
