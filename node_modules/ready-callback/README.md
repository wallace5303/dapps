# ready-callback

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/ready-callback.svg?style=flat-square
[npm-url]: https://npmjs.org/package/ready-callback
[travis-image]: https://img.shields.io/travis/node-modules/ready-callback.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/ready-callback
[codecov-image]: https://codecov.io/github/node-modules/ready-callback/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/node-modules/ready-callback?branch=master
[david-image]: https://img.shields.io/david/node-modules/ready-callback.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/ready-callback
[download-image]: https://img.shields.io/npm/dm/ready-callback.svg?style=flat-square
[download-url]: https://npmjs.org/package/ready-callback

Launch server after all async task ready

---

## Install

```
$ npm install ready-callback
```

## Usage

**Note: ready-callback is using `class`, so you should use node>=2**

```
var koa = require('koa');
var ready = require('ready-callback')();
var app = koa();
ready.mixin(app);

// register a service
var done = app.readyCallback('service');
serviceLaunch(done);

// callback will be fired after all service launched
app.ready(function() {
  app.listen();
});
```

### Error Handle

If task is called with error, `error` event will be emit, `ready` will never be called.

```
// register a service that will emit error
var done = app.readyCallback('service');
serviceLaunch(function(err) {
  done(err);
});

// listen error event
app.on('error', function(err) {
  // catch error
});
```

### Weak Dependency

If you set a task weak dependency, task will be done without emit `error`.

```
var done = app.readyCallback('service', {isWeakDep: true});
serviceLaunch(function(err) {
  done(err);
});

// will be ready
app.ready(function() {
  app.listen();
});

app.on('error', function(err) {
  // never be called
});
```

You can also set for all ready-callback

```
var ready = require('ready-callback')({isWeakDep: true});
```

### Ready Status

You can get status every callback end.

```
app.on('ready_stat', function(data) {
  console.log(data.id); // id of the ended task
  console.log(data.remain); // tasks waiting to be ended
});
```

### Timeout

You can set timeout when a task run a long time.

```
var ready = require('ready-callback')({timeout: 1000});
ready.mixin(app);
app.on('ready_timeout', function(id) {
  // this will be called after 1s that `service` task don't complete
});

var done = app.readyCallback('service');
serviceLaunch(function() {
  // run a long time
  done();
});
```

You can also set timeout for every task

```
ready.mixin(app);
app.on('ready_timeout', function(id) {
  // this will be called after 1s that `service` task don't complete
});

var done = app.readyCallback('service1', {timeout: 1000});
serviceLaunch(done);
```

### lazyStart

You can set a ready-callback object to lazyStart. It will not check 
ready status immediately, and should start manualy to check ready 
status.

```js
var ready = require('ready-callback')({ lazyStart: true });
yield sleep(1);
// ready obj is not ready
ready.start();
yield sleep(1);
// ready obj is ready now
```

## LISENCE

Copyright (c) 2015 popomore. Licensed under the MIT license.
