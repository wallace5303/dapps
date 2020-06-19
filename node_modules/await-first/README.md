# await-first
Wait the first event in a set of event pairs, then clean up after itself.

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/await-first.svg?style=flat-square
[npm-url]: https://npmjs.org/package/await-first
[travis-image]: https://img.shields.io/travis/node-modules/await-first.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/await-first
[codecov-image]: https://codecov.io/gh/node-modules/await-first/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/node-modules/await-first
[david-image]: https://img.shields.io/david/node-modules/await-first.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/await-first
[snyk-image]: https://snyk.io/test/npm/await-first/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/await-first
[download-image]: https://img.shields.io/npm/dm/await-first.svg?style=flat-square
[download-url]: https://npmjs.org/package/await-first

## Install

```
$ npm install await-first --save
```

## Example

- `awaitFirst(ee, events)`

```js
const EventEmitter = require('events');
const awaitFirst = require('await-first');

async function waitMessageOrClose(ee) {
  const o = await awaitFirst(ee, [ 'message', 'close' ]);

  switch (o.event) {
    case 'message':
      const msg = o.args[0]; // [ 'hello world' ]
      console.log('new message =>', msg);
      break;
    case 'close':
      console.log('closed');
      break;
  }
}

const ee = new EventEmitter();
waitMessageOrClose(ee);

setTimeout(() => {
  ee.emit('message', 'hello world');
}, 1000);
```

- `obj.awaitFirst(events)`

```js
const net = require('net');
const awaitFirst = require('await-first');

async function connect() {
  const socket = net.connect(8080, '127.0.0.1');
  socket.awaitFirst = awaitFirst;

  try {
    // wait `connect` or `error` event
    await socket.awaitFirst([ 'connect', 'error' ]);
  } catch (err) {
    console.log(err);
  }
  // ...
}

connect();
```