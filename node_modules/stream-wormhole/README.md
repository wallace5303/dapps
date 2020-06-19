stream-wormhole
=======

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/stream-wormhole.svg?style=flat-square
[npm-url]: https://npmjs.org/package/stream-wormhole
[travis-image]: https://img.shields.io/travis/node-modules/stream-wormhole.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/stream-wormhole
[codecov-image]: https://codecov.io/github/node-modules/stream-wormhole/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/node-modules/stream-wormhole?branch=master
[david-image]: https://img.shields.io/david/node-modules/stream-wormhole.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/stream-wormhole
[download-image]: https://img.shields.io/npm/dm/stream-wormhole.svg?style=flat-square
[download-url]: https://npmjs.org/package/stream-wormhole
[snyk-image]: https://snyk.io/test/npm/stream-wormhole/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/stream-wormhole

Pipe ReadStream to a wormhole.

## Usage

```js
const sendToWormhole = require('stream-wormhole');
const fs = require('fs');

const readStream = fs.createReadStream(__filename);

// ignore all error by default
sendToWormhole(readStream, true)
  .then(() => console.log('done'));

// throw error
sendToWormhole(readStream, true)
  .then(() => console.log('done'))
  .catch(err => console.error(err));
```

## License

[MIT](LICENSE)
