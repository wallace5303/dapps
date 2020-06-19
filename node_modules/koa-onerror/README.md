koa-onerror
=================

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/koa-onerror.svg?style=flat
[npm-url]: https://npmjs.org/package/koa-onerror
[travis-image]: https://img.shields.io/travis/koajs/onerror.svg?style=flat
[travis-url]: https://travis-ci.org/koajs/onerror
[codecov-image]: https://codecov.io/gh/koajs/onerror/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/koajs/onerror
[david-image]: https://img.shields.io/david/koajs/onerror.svg?style=flat
[david-url]: https://david-dm.org/koajs/onerror
[snyk-image]: https://snyk.io/test/npm/koa-onerror/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/koa-onerror
[download-image]: https://img.shields.io/npm/dm/koa-onerror.svg?style=flat-square
[download-url]: https://npmjs.org/package/koa-onerror

an error handler for koa, hack ctx.onerror.

different with [koa-error](https://github.com/koajs/error):
- we can not just use try catch to handle all errors, steams' and events'
errors are directly handle by `ctx.onerror`, so if we want to handle all
errors in one place, the only way i can see is to hack `ctx.onerror`.
- it is more customizable.

## install

```bash
npm install koa-onerror
```

## Usage

```js
const fs = require('fs');
const koa = require('koa');
const onerror = require('koa-onerror');

const app = new koa();

onerror(app);

app.use(ctx => {
  // foo();
  ctx.body = fs.createReadStream('not exist');
});
```

## Options

```js
onerror(app, options);
```

* **all**: if options.all exist, ignore negotiation
* **text**: text error handler
* **json**: json error handler
* **html**: html error handler
* **redirect**: if accepct html, can redirect to another error page

check out default handler to write your own handler.

## Status and Headers

`koa-onerror` will automatic set `err.status` as response status code, and `err.headers` as response headers.

## License

[MIT](LICENSE)
