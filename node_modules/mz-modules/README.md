# mz-modules

Same as [mz], but wrap many popular modules rather than core API.

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/mz-modules.svg?style=flat-square
[npm-url]: https://npmjs.org/package/mz-modules
[travis-image]: https://img.shields.io/travis/node-modules/mz-modules.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/mz-modules
[codecov-image]: https://codecov.io/gh/node-modules/mz-modules/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/node-modules/mz-modules
[david-image]: https://img.shields.io/david/node-modules/mz-modules.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/mz-modules
[snyk-image]: https://snyk.io/test/npm/mz-modules/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/mz-modules
[download-image]: https://img.shields.io/npm/dm/mz-modules.svg?style=flat-square
[download-url]: https://npmjs.org/package/mz-modules

Node require `>= 4.0.0`

## Usage

Install it

```bash
$ npm i mz-modules
```

Require it

```js
const mkdirp = require('mz-modules/mkdirp');
```

You can also require it from the main entry, but it will load other modules in mz-modules.

```js
const mkdirp = require('mz-modules').mkdirp;
```

Use it

```js
// Using promise
mkdirp('/path/to/dir').then(() => console.log('done'));

// Or if you are using async function
async function doSomething() {
  await mkdirp('/path/to/dir');
}
```

**Warning:** nextTick and setImmediate is little slower than callback, because promise queue is after nextTick.

## Modules

- `mz-modules/mkdirp` wrapped [mkdirp]
- `mz-modules/rimraf` wrapped [rimraf]
- `mz-modules/glob` wrapped [glob]
- `mz-modules/sleep` wrapped [ko-sleep]
- `mz-modules/nextTick` wrapped process.nextTick
- `mz-modules/setImmediate` wrapped setImmediate
- `mz-modules/pump` wrapped [pump]

## Contribute

You can request adding module to mz-modules

1. [Create a issue](https://github.com/node-modules/mz-modules/issues) let us know why you want to add the module.
1. Add a module, named `xx`
  - create `xx.js` that exports a function should return promise.
  - require `xx.js` in `index.js`
  - add a testcase for it in `test/xx.test.js`
  - add xx.js to files in `package.json`
1. Create a pull request

## License

[MIT](LICENSE)

[mz]: https://github.com/normalize/mz
[mkdirp]: https://github.com/substack/node-mkdirp
[rimraf]: https://github.com/isaacs/rimraf
[ko-sleep]: https://github.com/alsotang/ko-sleep
[glob]: https://github.com/isaacs/node-glob
[pump]: https://github.com/mafintosh/pump
