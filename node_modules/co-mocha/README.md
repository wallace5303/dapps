# Co Mocha

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Greenkeeper badge](https://badges.greenkeeper.io/blakeembrey/co-mocha.svg)](https://greenkeeper.io/)

Enable support for generators in Mocha tests using [co](https://github.com/visionmedia/co).

Use the `--harmony-generators` flag when running node 0.11.x to access generator functions, or transpile your tests using [traceur](https://github.com/google/traceur-compiler) or [regenerator](https://github.com/facebook/regenerator).

## Installation

```
npm install co-mocha --save-dev
```

## Usage

Just require the module in your tests and start writing generators in your tests.

```js
it('should do something', function * () {
  yield users.load(123)
})
```

### Node

Install the module using `npm install co-mocha --save-dev`. Now just require the module to automatically monkey patch any available `mocha` instances. With `mocha`, you have multiple ways of requiring the module - add `--require co-mocha` to your `mocha.opts` or add `require('co-mocha')` inside your main test file.

If you need to monkey patch a different mocha instance you can use the library directly:

```js
var mocha = require('mocha')
var coMocha = require('co-mocha')

coMocha(mocha)
```

### `<script>` Tag

```html
<script src="co-mocha.js"></script>
```

Including the browserified script will automatically patch `window.Mocha`. Just make sure you include it after `mocha.js`. If that is not possible the library exposes `window.coMocha`, which can be used (`window.coMocha(window.Mocha)`).

### AMD

Same details as the script, but using AMD requires instead.

## How It Works

The module monkey patches the `Runnable.prototype.run` method of `mocha` to enable generators. In contrast to other npm packages, `co-mocha` extends `mocha` at runtime - allowing you to use any compatible mocha version.

## License

MIT

[npm-image]: https://img.shields.io/npm/v/co-mocha.svg?style=flat
[npm-url]: https://npmjs.org/package/co-mocha
[downloads-image]: https://img.shields.io/npm/dm/co-mocha.svg?style=flat
[downloads-url]: https://npmjs.org/package/co-mocha
[travis-image]: https://img.shields.io/travis/blakeembrey/co-mocha.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/co-mocha
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/co-mocha.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/co-mocha?branch=master
