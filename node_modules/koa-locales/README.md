koa-locales
=======

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][cov-image]][cov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

koa locales, i18n solution for koa:

1. All locales resources location on `options.dirs`.
2. resources file supports: `*.js`, `*.json` and `*.properties`, see [examples](test/locales/).
3. One api: `__(key[, value, ...])`.
4. Auto detect request locale from `query`, `cookie` and `header: Accept-Language`.

## Installation

```bash
$ npm install koa-locales --save
```

## Quick start

```js
const koa = require('koa');
const locales = require('koa-locales');

const app = koa();
const options = {
  dirs: [__dirname + '/locales', __dirname + '/foo/locales'],
};
locales(app, options);
```

## API Reference

### `locales(app, options)`

Patch locales functions to koa app.

- {Application} app: koa app instance.
- {Object} options: optional params.
  - {String} functionName: locale function name patch on koa context. Optional, default is `__`.
  - {String} dirs: locales resources store directories. Optional, default is `['$PWD/locales']`.
  - {String} defaultLocale: default locale. Optional, default is `en-US`.
  - {String} queryField: locale field name on query. Optional, default is `locale`.
  - {String} cookieField: locale field name on cookie. Optional, default is `locale`.
  - {String} cookieDomain: domain on cookie. Optional, default is `''`.
  - {Object} localeAlias: locale value map. Optional, default is `{}`.
  - {String|Number} cookieMaxAge: set locale cookie value max age. Optional, default is `1y`, expired after one year.

```js
locales({
  app: app,
  dirs: [__dirname + '/app/locales'],
  defaultLocale: 'zh-CN',
});
```

#### Aliases

The key `options.localeAlias` allows to not repeat dictionary files, as you can configure to use the same file for *es_ES* for *es*, or *en_UK* for *en*.

```js
locales({
  localeAlias: {
    es: es_ES,
    en: en_UK,
  },
});
```

### `context.__(key[, value1[, value2, ...]])`

Get current request locale text.

```js
async function home(ctx) {
  ctx.body = {
    message: ctx.__('Hello, %s', 'fengmk2'),
  };
}
```

Examples:

```js
__('Hello, %s. %s', 'fengmk2', 'koa rock!')
=>
'Hello fengmk2. koa rock!'

__('{0} {0} {1} {1} {1}', ['foo', 'bar'])
=>
'foo foo bar bar bar'

__('{a} {a} {b} {b} {b}', {a: 'foo', b: 'bar'})
=>
'foo foo bar bar bar'
```

### `context.__getLocale()`

Get locale from query / cookie and header.

### `context.setLocale()`

Set locale and cookie.

### `context.__getLocaleOrigin()`

Where does locale come from, could be `query`, `cookie`, `header` and `default`.

### `app.__(locale, key[, value1[, value2, ...]])`

Get the given locale text on application level.

```js
console.log(app.__('zh', 'Hello'));
// stdout '你好' for Chinese
```

## Usage on template

```js
this.state.__ = this.__.bind(this);
```

[Nunjucks] example:

```html
{{ __('Hello, %s', user.name) }}
```

[Pug] example:

```pug
p= __('Hello, %s', user.name)
```

[Koa-pug] integration:

You can set the property *locals* on the KoaPug instance, where the default locals are stored.

```js
app.use(async (ctx, next) => {
  koaPug.locals.__ = ctx.__.bind(ctx);
  await next();
});
```

## Debugging

If you are interested on knowing what locale was chosen and why you can enable the debug messages from [debug].

There is two level of verbosity:

```sh
$ DEBUG=koa-locales node .
```
With this line it only will show one line per request, with the chosen language and the origin where the locale come from (queryString, header or cookie).

```sh
$ DEBUG=koa-locales:silly node .
```
Use this level if something doesn't work as you expect. This is going to debug everything, including each translated line of text.

## License

[MIT](LICENSE)


[nunjucks]: https://www.npmjs.com/package/nunjucks
[debug]: https://www.npmjs.com/package/debug
[pug]: https://www.npmjs.com/package/pug
[koa-pug]: https://www.npmjs.com/package/koa-pug

[npm-image]: https://img.shields.io/npm/v/koa-locales.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-locales
[travis-image]: https://img.shields.io/travis/koajs/locales.svg?style=flat-square
[travis-url]: https://travis-ci.org/koajs/locales
[cov-image]: https://codecov.io/github/koajs/locales/coverage.svg?branch=master
[cov-url]: https://codecov.io/github/koajs/locales?branch=master
[david-image]: https://img.shields.io/david/koajs/locales.svg?style=flat-square
[david-url]: https://david-dm.org/koajs/locales
[download-image]: https://img.shields.io/npm/dm/koa-locales.svg?style=flat-square
[download-url]: https://npmjs.org/package/koa-locales
