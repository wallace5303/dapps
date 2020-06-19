# egg-development

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-development.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-development
[travis-image]: https://img.shields.io/travis/eggjs/egg-development.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-development
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-development.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-development?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-development.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-development
[snyk-image]: https://snyk.io/test/npm/egg-development/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-development
[download-image]: https://img.shields.io/npm/dm/egg-development.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-development

This is an egg plugin for local development, under development environment enabled by default, and closed under other environment.

`egg-development` has been built-in for egg. It is enabled by default.


## Configuration

see [config/config.default.js](https://github.com/eggjs/egg-development/blob/master/config/config.default.js) for more detail.

## Features

- Under development environment, Output request log in STDOUT, statistic and output all key parts time-consuming;
- Watch file changes, and reload application；

### About Reload

Under the following directory (including subdirectories) will watch file changes under development environment by default, trigger an Egg development environment server reload:

- ${app_root}/app
- ${app_root}/config
- ${app_root}/mocks
- ${app_root}/mocks_proxy
- ${app_root}/app.js

> set `config.development.overrideDefault` to `true` to skip defaults merge.

Under the following directory (including subdirectories) will ignore file changes under development environment by default:

- ${app_root}/app/view
- ${app_root}/app/assets
- ${app_root}/app/public

Developer can use `config.reloadPattern`([multimatch](https://github.com/sindresorhus/multimatch)) to control whether to reload.

```js
// config/config.default.js
exports.development = {
  // don't reload when ts fileChanged
  // https://github.com/sindresorhus/multimatch
  reloadPattern: ['**', '!**/*.ts'],
};
```

### Loader Trace

You can view loader trace for performance issue from `http://127.0.0.1:7001/__loader_trace__`

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](https://github.com/eggjs/egg-development/blob/master/LICENSE)
