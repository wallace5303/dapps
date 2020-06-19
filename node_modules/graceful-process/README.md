# graceful-process

graceful exit process even parent exit on SIGKILL.

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![NPM download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/graceful-process.svg?style=flat-square
[npm-url]: https://npmjs.org/package/graceful-process
[travis-image]: https://img.shields.io/travis/node-modules/graceful-process.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/graceful-process
[codecov-image]: https://codecov.io/gh/node-modules/graceful-process/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/node-modules/graceful-process
[david-image]: https://img.shields.io/david/node-modules/graceful-process.svg?style=flat-square
[david-url]: https://david-dm.org/{{org}}/graceful-process
[snyk-image]: https://snyk.io/test/npm/graceful-process/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/graceful-process
[download-image]: https://img.shields.io/npm/dm/graceful-process.svg?style=flat-square
[download-url]: https://npmjs.org/package/graceful-process

## Install

```bash
npm i graceful-process --save
```

## Usage

Require this module and execute it on every child process file.

```js
// mycli.js
require('graceful-process')({ logger: console, label: 'mycli-child-cmd' });
```

## Support

- [x] cluster
- [x] child_process.fork()
- [ ] child_process.spawn()
