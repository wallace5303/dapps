# egg-watcher
File watcher plugin for egg

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-watcher.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-watcher
[travis-image]: https://img.shields.io/travis/eggjs/egg-watcher.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-watcher
[codecov-image]: https://codecov.io/github/eggjs/egg-watcher/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-watcher?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-watcher.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-watcher
[snyk-image]: https://snyk.io/test/npm/egg-watcher/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-watcher
[download-image]: https://img.shields.io/npm/dm/egg-watcher.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-watcher

## Usage

In worker process:

### app.watcher.watch(path, listener)
Start watching file(s).

- path(String|Array): file path(s)
- listener(Function): file change callback

### app.watcher.unwatch(path[, listener])
Stop watching file(s).

- path(String|Array): file path(s)
- listener(Function): file change callback

In agent process:

### agent.watcher.watch(path, listener)
Start watching file(s).

- path(String|Array): file path(s)
- listener(Function): file change callback

### agent.watcher.unwatch(path[, listener])
Stop watching file(s).

- path(String|Array): file path(s)
- listener(Function): file change callback

## Watching mode

### `development` Mode

There's a built-in [development mode](https://github.com/eggjs/egg-watcher/blob/master/lib/event-sources/development.js) which works in local(env is `local`). Once files on disk is modified it will emit a `change` event immediately.

### Customize Watching Mode

Say we want to build a custom event source plugin (package name: `egg-watcher-custom`, eggPlugin.name: `watcherCustom`).

Firstly define our custom event source like this:

```js
// {plugin_root}/lib/custom_event_source.js
const Base = require('sdk-base');

class CustomEventSource extends Base {
  // `opts` comes from app.config[${eventSourceName}]
  // `eventSourceName` will be registered later in
  // `config.watcher.eventSources` as the key shown below
  constructor(opts) {
    super(opts);
    this.ready(true);
  }

  watch(path) {
    // replace this with your desired way of watching,
    // when aware of any change, emit a `change` event
    // with an info object containing `path` property
    // specifying the changed directory or file.
    this._h = setInterval(() => {
      this.emit('change', { path });
    }, 1000);
  }

  unwatch() {
    // replace this with your implementation
    if (this._h) {
      clearInterval(this._h);
    }
  }
}

module.exports = CustomEventSource;
```

Event source implementations varies according to your running environment. When working with vagrant, docker, samba or such other non-standard way of development, you should use a different watch API specific to what you are working with.

Then add your custom event source to config:

```js
// config.default.js
exports.watcher = {
  eventSources: {
    custom: require('../lib/custom_event_source'),
  },
};
```

Choose to use your custom watching mode in your desired env.

```js
// config.${env}.js
exports.watcher = {
  type: 'custom',
};

// this will pass to your CustomEventSource constructor as opts
exports.watcherCustom = {
  // foo: 'bar',
};
```

If possible, plugins named like `egg-watcher-${customName}`(`egg-watcher-vagrant` eg.) are recommended.

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](https://github.com/eggjs/egg-watcher/blob/master/LICENSE)
