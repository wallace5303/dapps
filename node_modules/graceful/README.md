# graceful

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][cov-image]][cov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/graceful.svg?style=flat-square
[npm-url]: https://npmjs.org/package/graceful
[travis-image]: https://img.shields.io/travis/node-modules/graceful.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/graceful
[cov-image]: https://codecov.io/github/node-modules/cfork/coverage.svg?branch=master
[cov-url]: https://codecov.io/github/node-modules/cfork?branch=master
[david-image]: https://img.shields.io/david/node-modules/cfork.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/cfork
[download-image]: https://img.shields.io/npm/dm/graceful.svg?style=flat-square
[download-url]: https://npmjs.org/package/graceful


Graceful exit when `uncaughtException` emit, base on `process.on('uncaughtException')`.

## Why we should use this module

It's the best way to handle `uncaughtException` on current situations.

* [domain failure](https://github.com/fengmk2/domain-middleware/blob/master/example/failure.js).
* [Node.js 异步异常的处理与domain模块解析](http://deadhorse.me/nodejs/2013/04/13/exception_and_domain.html)

## Install

```bash
$ npm install graceful
```

## Usage

Please see [connect_with_cluster](https://github.com/fengmk2/graceful/tree/master/example/connect_with_cluster) example.

This below code just for dev demo, don't use it on production env:

```js
var express = require('express');
var graceful = require('graceful');

var app = express()
.use()
.use(function(req, res){
  if (Math.random() > 0.5) {
    foo.bar();
  }
  setTimeout(function() {
    if (Math.random() > 0.5) {
      throw new Error('Asynchronous error from timeout');
    } else {
      res.end('Hello from Connect!');
    }
  }, 100);
  setTimeout(function() {
    if (Math.random() > 0.5) {
      throw new Error('Mock second error');
    }
  }, 200);
})
.use(function(err, req, res, next) {
  res.end(err.message);
});

var server = app.listen(1984);

graceful({
  servers: [server],
  killTimeout: '30s',
});
```

If you have multi servers on one process, you just add them to `server`:

```js
graceful({
  servers: [server1, server2, restapi],
  killTimeout: '15s',
});
```

If you are using [pm](https://github.com/aleafs/pm),
you can follow the [graceful_exit with pm demo](https://github.com/aleafs/pm/tree/master/demo/graceful_exit).

## License

(The MIT License)

Copyright (c) 2013 - 2014 fengmk2 &lt;fengmk2@gmail.com&gt;
Copyright (c) 2015 - 2016 node-modules and other contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
