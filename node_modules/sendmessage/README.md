sendmessage
=======

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Gittip][gittip-image]][gittip-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/sendmessage.svg?style=flat-square
[npm-url]: https://npmjs.org/package/sendmessage
[travis-image]: https://img.shields.io/travis/node-modules/sendmessage.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/sendmessage
[coveralls-image]: https://img.shields.io/coveralls/node-modules/sendmessage.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/node-modules/sendmessage?branch=master
[gittip-image]: https://img.shields.io/gittip/fengmk2.svg?style=flat-square
[gittip-url]: https://www.gittip.com/fengmk2/
[david-image]: https://img.shields.io/david/node-modules/sendmessage.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/sendmessage
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/sendmessage.svg?style=flat-square
[download-url]: https://npmjs.org/package/sendmessage

Send a cross process message if message channel is connected.
Avoid [channel closed](https://github.com/joyent/node/blob/cfcb1de130867197cbc9c6012b7e84e08e53d032/lib/child_process.js#L411) error throw out.

## Install

```bash
$ npm install sendmessage --save
```

## Usage

### master.js

```js
var childprocess = require('child_process');
var sendmessage = require('sendmessage');

var worker = childprocess.fork('./worker.js');
sendmessage(worker, {hi: 'this is a message to worker'});
```

### worker.js

```js
var sendmessage = require('sendmessage');

sendmessage(process, {hello: 'this is a message to master'});
```

## API

### #sendmessage(childprocess, message);

Send a cross process message.
If a process is not child process, this will just call `process.emit('message', message)` instead.

- childprocess: child process instance
- message: the message need to send

```js
sendmessage(process, {hello: 'this is a message to master'});
```

You can switch to `process.emit('message', message)` using `process.env.SENDMESSAGE_ONE_PROCESS`

## Test

```bash
$ npm install
$ npm test
```

### Coverage

```bash
$ npm test-cov
```

## License

(The MIT License)

Copyright (c) 2014 - 2015 fengmk2 <fengmk2@gmail.com> and other contributors

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
