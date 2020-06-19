# Koa Static Cache

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![David deps][david-image]][david-url]

[npm-image]: https://img.shields.io/npm/v/koa-static-cache.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-static-cache
[travis-image]: https://img.shields.io/travis/koajs/static-cache.svg?style=flat-square
[travis-url]: https://travis-ci.org/koajs/static-cache
[coveralls-image]: https://img.shields.io/coveralls/koajs/static-cache.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/koajs/static-cache?branch=master
[david-image]: https://img.shields.io/david/koajs/static-cache.svg?style=flat-square
[david-url]: https://david-dm.org/koajs/static-cache

Static server for koa.

Differences between this library and other libraries such as [static](https://github.com/koajs/static):

- There is no directory or `index.html` support.
- You may optionally store the data in memory - it streams by default.
- Caches the assets on initialization - you need to restart the process to update the assets.(can turn off with options.preload = false)
- Uses MD5 hash sum as an ETag.
- Uses .gz files if present on disk, like nginx gzip_static module

## Installation

```js
$ npm install koa-static-cache
```

## API

### staticCache(dir [, options] [, files])

```js
var path = require('path')
var staticCache = require('koa-static-cache')

app.use(staticCache(path.join(__dirname, 'public'), {
  maxAge: 365 * 24 * 60 * 60
}))
```

- `dir` (str) - the directory you wish to serve, priority than `options.dir`.
- `options.dir` (str) - the directory you wish to serve, default to `process.cwd`.
- `options.maxAge` (int) - cache control max age for the files, `0` by default.
- `options.cacheControl` (str) - optional cache control header. Overrides `options.maxAge`.
- `options.buffer` (bool) - store the files in memory instead of streaming from the filesystem on each request.
- `options.gzip` (bool) - when request's accept-encoding include gzip, files will compressed by gzip.
- `options.usePrecompiledGzip` (bool) - try use gzip files, loaded from disk, like nginx gzip_static
- `options.alias` (obj) - object map of aliases. See below.
- `options.prefix` (str) - the url prefix you wish to add, default to `''`.
- `options.dynamic` (bool) - dynamic load file which not cached on initialization.
- `options.filter` (function | array) - filter files at init dir, for example - skip non build (source) files. If array set - allow only listed files
- `options.preload` (bool) - caches the assets on initialization or not, default to `true`. always work together with `options.dynamic`.
- `options.files` (obj) - optional files object. See below.
- `files` (obj) - optional files object. See below.
### Aliases

For example, if you have this alias object:

```js
{
  '/favicon.png': '/favicon-32.png'
}
```

Then requests to `/favicon.png` will actually return `/favicon-32.png` without redirects or anything.
This is particularly important when serving [favicons](https://github.com/audreyr/favicon-cheat-sheet) as you don't want to store duplicate images.

### Files

You can pass in an optional files object.
This allows you to do two things:

#### Combining directories into a single middleware

Instead of doing:

```js
app.use(staticCache('/public/js'))
app.use(staticCache('/public/css'))
```

You can do this:

```js
var files = {}

// Mount the middleware
app.use(staticCache('/public/js', {}, files))

// Add additional files
staticCache('/public/css', {}, files)
```

The benefit is that you'll have one less function added to the stack as well as doing one hash lookup instead of two.

#### Editing the files object

For example, if you want to change the max age of `/package.json`, you can do the following:

```js
var files = {}

app.use(staticCache('/public', {
  maxAge: 60 * 60 * 24 * 365
}, files))

files['/package.json'].maxAge = 60 * 60 * 24 * 30
```

#### Using a LRU cache to avoid OOM when dynamic mode enabled

You can pass in a lru cache instance which has tow methods: `get(key)` and `set(key, value)`.

```js
var LRU = require('lru-cache')
var files = new LRU({ max: 1000 })

app.use(staticCache({
  dir: '/public',
  dynamic: true,
  files: files
}))
```

## License

The MIT License (MIT)

Copyright (c) 2013 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
