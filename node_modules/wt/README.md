wt
=======

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![appveyor build status][appveyor-image]][appveyor-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/wt.svg?style=flat-square
[npm-url]: https://npmjs.org/package/wt
[travis-image]: https://img.shields.io/travis/node-modules/wt.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/wt
[appveyor-image]: https://ci.appveyor.com/api/projects/status/9x637qe09ivo8g2h?svg=true
[appveyor-url]: https://ci.appveyor.com/project/fengmk2/wt
[codecov-image]: https://codecov.io/github/node-modules/wt/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/node-modules/wt?branch=master
[david-image]: https://img.shields.io/david/node-modules/wt.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/wt
[download-image]: https://img.shields.io/npm/dm/wt.svg?style=flat-square
[download-url]: https://npmjs.org/package/wt

wt: Simple dir watcher, including all subdirectories, support events and multi dirs:

* `all`: every change event
* `file`: file change event, not include file remove
* `dir`: dir change event, not include dir remove
* `remove`: file or dir remove event

## Install

```bash
$ npm install wt
```

## Usage

```js
var wt = require('wt');

var watcher = wt.watch(['/home/foouser/data1', '/home/foouser/data2']);
watcher.on('all', function (info) {

}).on('file', function (info) {

}).on('dir', function (info) {

});

setTimeout(function () {
  watcher.close();
}, 10000);
```

## Other Events

- `on('error', function (err) {})`: watcher error event, e.g.: watching not exists dir
- `on('watch', function (dir) {})`: a new dir watcher start
- `on('unwatch', function (dir) {})`: watching dir removed, will emit this event

## Known issues

- Remove a sub dir, all files in the remove dir won't fire `remove` event.
Only fire `remove` event on the sub dir once.

## License

(The MIT License)

Copyright (c) 2014 fengmk2 <fengmk2@gmail.com> and other contributors
Copyright (c) 2015 - present node-modules and other contributors

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
