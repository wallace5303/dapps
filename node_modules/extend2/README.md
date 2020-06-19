# extend2

Forked from [node-extend], the difference is overriding array as primitive when deep clone.

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/extend2.svg?style=flat-square
[npm-url]: https://npmjs.org/package/extend2
[travis-image]: https://img.shields.io/travis/eggjs/extend2.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/extend2
[codecov-image]: https://codecov.io/gh/eggjs/extend2/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/eggjs/extend2
[david-image]: https://img.shields.io/david/eggjs/extend2.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/extend2
[snyk-image]: https://snyk.io/test/npm/extend2/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/extend2
[download-image]: https://img.shields.io/npm/dm/extend2.svg?style=flat-square
[download-url]: https://npmjs.org/package/extend2

## Usage

```js
const extend = require('extend2');

// for deep clone
extend(true, {}, object1, objectN);
```

## License

`node-extend` is licensed under the [MIT License][mit-license-url].

## Acknowledgements

All credit to the jQuery authors for perfecting this amazing utility.

Ported to Node.js by [Stefan Thomas][github-justmoon] with contributions by [Jonathan Buchanan][github-insin] and [Jordan Harband][github-ljharb].

[mit-license-url]: http://opensource.org/licenses/MIT
[github-justmoon]: https://github.com/justmoon
[github-insin]: https://github.com/insin
[github-ljharb]: https://github.com/ljharb
[node-extend]: https://github.com/justmoon/node-extend
