# ypkgfiles

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/ypkgfiles.svg?style=flat-square
[npm-url]: https://npmjs.org/package/ypkgfiles
[travis-image]: https://img.shields.io/travis/popomore/ypkgfiles.svg?style=flat-square
[travis-url]: https://travis-ci.org/popomore/ypkgfiles
[codecov-image]: https://codecov.io/gh/popomore/ypkgfiles/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/popomore/ypkgfiles
[david-image]: https://img.shields.io/david/popomore/ypkgfiles.svg?style=flat-square
[david-url]: https://david-dm.org/popomore/ypkgfiles
[snyk-image]: https://snyk.io/test/npm/ypkgfiles/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/ypkgfiles
[download-image]: https://img.shields.io/npm/dm/ypkgfiles.svg?style=flat-square
[download-url]: https://npmjs.org/package/ypkgfiles

Yet another pkgfiles that generate pkg.files automatically

## Why

Recommend [pkg.files] instead of `.npmignore` to choose which file should be included when npm publish. However, we will miss some files or directories when published, and should fix with another publishing.

Using ypkgfiles, it will generate pkg.files automatically with some configuration.

## Usage

```bash
$ npm install ypkgfiles
$ pkgfiles
```

Then `files` will be generated in `package.json`. ypkgfiles will lookup files from the main export.

If you want to publish some files that is not based on main export, such as `mz`

```js
require('mz/fs')
```

You can use `--entry fs.js` options to add to files automatically. If have more files, you can use glob `--entry *.js`.

## License

[MIT](LICENSE)

[pkg.files]: https://docs.npmjs.com/files/package.json#files
