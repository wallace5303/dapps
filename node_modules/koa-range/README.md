
koa-range
=================
range request implementation for koa

[![NPM version][npm-img]][npm-url]
[![Build status][travis-img]][travis-url]
[![Test coverage][coveralls-img]][coveralls-url]
[![License][license-img]][license-url]
[![Dependency status][david-img]][david-url]

[![NPM](https://nodei.co/npm/koa-range.png?stars&downloads)](https://nodei.co/npm/koa-range/)
[![NPM](https://nodei.co/npm-dl/koa-range.png)](https://nodei.co/npm/koa-range/)

### Installation

```sh
$ npm install koa-range
```

### Usage (with koa@2)

```js
var fs = require('fs');
var range = require('koa-range');
var route = require('koa-route');
var Koa = require('koa');
var app = new Koa();

app.use(range);

// via buffer
app.use(route.get('/', async function (ctx) {
  ctx.body = new Buffer(100);
}));

// via object
app.use(route.get('/json', async function (ctx) {
  ctx.body = {
    'foo': 'bar'
  };
}));

// via readable stream
app.use(route.get('/stream', async function (ctx) {
  ctx.body = fs.createReadStream('your path');
}));

```

Until async/await is supported by default, you will need to do one of the following:
- Transpile your code with somehting like Babel
- Use node v7 with --harmony-async-await flag

### License

MIT

[npm-img]: https://img.shields.io/npm/v/koa-range.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-range
[travis-img]: https://img.shields.io/travis/koajs/koa-range.svg?style=flat-square
[travis-url]: https://travis-ci.org/koajs/koa-range
[coveralls-img]: https://img.shields.io/coveralls/koajs/koa-range.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/koajs/koa-range?branch=master
[license-img]: https://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: https://opensource.org/licenses/MIT
[david-img]: https://img.shields.io/david/koajs/koa-range.svg?style=flat-square
[david-url]: https://david-dm.org/koajs/koa-range
