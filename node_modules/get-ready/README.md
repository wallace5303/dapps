# get-ready
=====

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/get-ready.svg?style=flat-square
[npm-url]: https://npmjs.org/package/get-ready
[travis-image]: https://img.shields.io/travis/node-modules/ready.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/ready
[codecov-image]: https://codecov.io/github/node-modules/ready/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/node-modules/ready?branch=master
[david-image]: https://img.shields.io/david/node-modules/ready.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/ready
[download-image]: https://img.shields.io/npm/dm/get-ready.svg?style=flat-square
[download-url]: https://npmjs.org/package/get-ready

**Fork from [supershabam/ready](https://github.com/supershabam/ready)**

NodeJS mixin to add one-time ready event

## Usage

Using `ready` or `ready.mixin` to add `ready` method to the given object.

```js
const ready = require('get-ready');
const obj = {};
ready.mixin(obj);

// register a callback
obj.ready(() => console.log('ready'));

// mark ready
obj.ready(true);
```

### Register

Register a callback to the callback stack, it will be called when mark as ready, see example above.

If the callback is undefined, register will return a promise.

```js
obj.ready().then(() => console.log('ready'));
obj.ready(true);
```

If it has been ready, the callback will be called immediately.

```js
// already ready
obj.ready(true);
obj.ready().then(() => console.log('ready'));
```

**Warning: the callback is called after nextTick**

### Emit

Mark it as ready, you can simply using `.ready(true)`.

You can also mark it not ready.

```js
obj.ready(true);
// call immediately
obj.ready(() => console.log('ready'));

obj.ready(false);
obj.ready(() => throw 'don\'t run');
```

When exception throws, you can pass an error object, then the callback will receive it as the first argument.

```js
obj.ready(err => console.log(err));
obj.ready(new Error('err'));
```


## License

[MIT](LICENSE)
