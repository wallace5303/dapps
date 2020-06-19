# egg-jsonp

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-jsonp.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-jsonp
[travis-image]: https://img.shields.io/travis/eggjs/egg-jsonp.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-jsonp
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-jsonp.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-jsonp?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-jsonp.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-jsonp
[snyk-image]: https://snyk.io/test/npm/egg-jsonp/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-jsonp
[download-image]: https://img.shields.io/npm/dm/egg-jsonp.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-jsonp

An egg plugin for jsonp support.

## Install

```bash
$ npm i egg-jsonp --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.jsonp = {
  enable: true,
  package: 'egg-jsonp',
};
```

## Configuration

* {String|Array} callback - jsonp callback method key, default to `[ '_callback', 'callback' ]`
* {Number} limit - callback method name's max length, default to `50`
* {Boolean} csrf - enable csrf check or not. default to false
* {String|RegExp|Array} whiteList - referrer white list

if whiteList's type is `RegExp`, referrer must match `whiteList`, pay attention to the first `^` and last `/`.

```js
exports.jsonp = {
  whiteList: /^https?:\/\/test.com\//,
}
// matchs referrer:
// https://test.com/hello
// http://test.com/
```

if whiteList's type is `String` and starts with `.`:

```js
exports.jsonp = {
  whiteList: '.test.com',
};
// matchs domain test.com:
// https://test.com/hello
// http://test.com/

// matchs subdomain
// https://sub.test.com/hello
// http://sub.sub.test.com/
```

if whiteList's type is `String` and not starts with `.`:

```js
exports.jsonp = {
  whiteList: 'sub.test.com',
};
// only matchs domain sub.test.com:
// https://sub.test.com/hello
// http://sub.test.com/
```

whiteList also can be an array:

```js
exports.jsonp = {
  whiteList: [ '.foo.com', '.bar.com' ],
};
```

see [config/config.default.js](https://github.com/eggjs/egg-jsonp/blob/master/config/config.default.js) for more detail.

## API

* ctx.acceptJSONP - detect if response should be jsonp, readonly

## Example

In `app/router.js`

```js
// Create once and use in any router you want to support jsonp.
const jsonp = app.jsonp();
app.get('/default', jsonp, 'jsonp.index');
app.get('/another', jsonp, 'jsonp.another');

// Customize by create another jsonp middleware with specific sonfigurations.
app.get('/customize', app.jsonp({ callback: 'fn' }), 'jsonp.customize');
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](https://github.com/eggjs/egg-jsonp/blob/master/LICENSE)

