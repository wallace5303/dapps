# egg-view-ejs

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-view-ejs.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-view-ejs
[travis-image]: https://img.shields.io/travis/eggjs/egg-view-ejs.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-view-ejs
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-view-ejs.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-view-ejs?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-view-ejs.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-view-ejs
[snyk-image]: https://snyk.io/test/npm/egg-view-ejs/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-view-ejs
[download-image]: https://img.shields.io/npm/dm/egg-view-ejs.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-view-ejs

egg view plugin for [ejs].

## Install

```bash
$ npm i egg-view-ejs --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.ejs = {
  enable: true,
  package: 'egg-view-ejs',
};

// {app_root}/config/config.default.js
exports.view = {
  mapping: {
    '.ejs': 'ejs',
  },
};

// ejs config
exports.ejs = {};
```

Create a ejs file

```js
// app/view/hello.ejs
hello <%= data %>
```

Render it

```js
// app/controller/render.js
exports.ejs = async ctx => {
  await ctx.render('hello.ejs', {
    data: 'world',
  });
};
```

The file will be compiled and cached, you can change `config.ejs.cache = false` to disable cache, it's disable in local env by default.

### Include

You can include both relative and absolute file.

Relative file is resolve from current file path.

```html
// app/view/a.ejs include app/view/b.ejs
<% include b.ejs %>
```

Absolute file is resolve from `app/view`.

```html
// app/view/home.ejs include app/view/partial/menu.ejs
<% include /partial/menu.ejs %>
```

### Layout

You can render a view with layout also:

```js
// app/view/layout.ejs

<%- body%>

// app/controller/render.js
exports.ejs = async ctx => {
  const locals = {
    data: 'world',
  };

  const viewOptions = {
    layout: 'layout.ejs'
  };

  await ctx.render('hello.ejs', locals, viewOptions);
};
```

## Configuration

see [config/config.default.js](config/config.default.js) for more detail.

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)

[ejs]: https://github.com/mde/ejs
