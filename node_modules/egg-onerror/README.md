# egg-onerror

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-onerror.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-onerror
[travis-image]: https://img.shields.io/travis/eggjs/egg-onerror.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-onerror
[codecov-image]: https://codecov.io/github/eggjs/egg-onerror/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-onerror?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-onerror.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-onerror
[snyk-image]: https://snyk.io/test/npm/egg-onerror/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-onerror
[download-image]: https://img.shields.io/npm/dm/egg-onerror.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-onerror

Default error handling plugin for egg.

## Install

```bash
$ npm i egg-onerror
```

## Usage

`egg-onerror` is on by default in egg. But you still can configure its properties to fits your scenarios.

- `errorPageUrl: String or Function` - If user request html pages in production environment and unexpected error happened, it will redirect user to `errorPageUrl`.
- `accepts: Function` - detect user's request accpet `json` or `html`.
- `all: Function` - customize error handler, if `all` present, negotiation will be ignored.
- `html: Function` - customize html error handler.
- `text: Function` - customize text error handler.
- `json: Function` - customize json error handler.
- `jsonp: Function` - customize jsonp error handler.

```js
// config.default.js
// errorPageUrl support funtion
exports.onerror = {
  errorPageUrl: (err, ctx) => ctx.errorPageUrl || '/500',
};

// an accept detect function that mark all request with `x-requested-with=XMLHttpRequest` header accepts json.
function accepts(ctx) {
  if (ctx.get('x-requested-with') === 'XMLHttpRequest') return 'json';
  return 'html';
}
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](https://github.com/eggjs/egg-onerror/blob/master/LICENSE)
