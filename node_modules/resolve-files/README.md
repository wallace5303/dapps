# resolve-files

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/resolve-files.svg?style=flat-square
[npm-url]: https://npmjs.org/package/resolve-files
[travis-image]: https://img.shields.io/travis/popomore/resolve-files.svg?style=flat-square
[travis-url]: https://travis-ci.org/popomore/resolve-files
[codecov-image]: https://codecov.io/gh/popomore/resolve-files/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/popomore/resolve-files
[david-image]: https://img.shields.io/david/popomore/resolve-files.svg?style=flat-square
[david-url]: https://david-dm.org/popomore/resolve-files
[snyk-image]: https://snyk.io/test/npm/resolve-files/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/resolve-files
[download-image]: https://img.shields.io/npm/dm/resolve-files.svg?style=flat-square
[download-url]: https://npmjs.org/package/resolve-files

Get all files from the given entry that resolved by `require`

## Usage

There are files in npm packages

```
|- package.json
|- index.js
`- lib
  `- index.js
```

And `index.js` requires `lib/index.js`, you can use `resolve-files` to get all files.

```js
const resolve = require('resolve-files');
const result = resolve({ cwd: process.cwd() });
// =>
// [
//   '$BASEDIR/index.js',
//   '$BASEDIR/lib/index.js',
// ]
```

It will resolve the entry

Normally, the result will include npm modules, but you can give an options `ignoreModules: true` to ignore modules (only return relative files).

## License

[MIT](LICENSE)
