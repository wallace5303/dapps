# egg-cors

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-cors.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-cors
[travis-image]: https://img.shields.io/travis/eggjs/egg-cors.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-cors
[codecov-image]: https://codecov.io/github/eggjs/egg-cors/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-cors?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-cors.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-cors
[snyk-image]: https://snyk.io/test/npm/egg-cors/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-cors
[download-image]: https://img.shields.io/npm/dm/egg-cors.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-cors

[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) plugin for egg, based on [@koa/cors](https://github.com/koajs/cors).

## Install

```bash
$ npm i egg-cors --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.cors = {
  enable: true,
  package: 'egg-cors',
};
```

`egg-cors` works internally with [egg-security](https://github.com/eggjs/egg-security). By defining the property of `domainWhiteList` on object `security`, you have successfully informed the framework to whitelist the passed domains.

When you make a request from client side, **egg** should return an `Access-Control-Allow-Origin` response header with the domain that you passed in along with the payload and status code *200*.

```js
exports.security = {
  domainWhiteList: [ 'http://localhost:4200' ],
};
```

## Configuration

Support all configurations in [@koa/cors](https://github.com/koajs/cors).

```js
// {app_root}/config/config.default.js
exports.cors = {
  // {string|Function} origin: '*',
  // {string|Array} allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
};
```

If the `origin` is set, the plugin will follow it to set the `Access-Control-Allow-Origin` and ignore the `security.domainWhiteList`. Otherwise, the `security.domainWhiteList` which is default will take effect as described above.

## Security

Only in safe domain list support CORS when security plugin enabled.

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
