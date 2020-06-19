# egg-validate

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-validate.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-validate
[travis-image]: https://img.shields.io/travis/eggjs/egg-validate.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-validate
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-validate.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-validate?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-validate.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-validate
[snyk-image]: https://snyk.io/test/npm/egg-validate/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-validate
[download-image]: https://img.shields.io/npm/dm/egg-validate.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-validate

Validate plugin for egg.

See [parameter](https://github.com/node-modules/parameter) for more information such as custom rule.

## Install

```bash
$ npm i egg-validate --save
```

## Usage

```js
// config/plugin.js
exports.validate = {
  enable: true,
  package: 'egg-validate',
};
```

### Configurations

egg-validate support all parameter's configurations, check [parameter documents](https://github.com/node-modules/parameter) to get more infomations.

```js
// config/config.default.js
exports.validate = {
  // convert: false,
  // validateRoot: false,
};
```

### Validate Request Body

```js
// app/controller/home.js
exports.index = function* () {
  this.validate({ id: 'id' }); // will throw if invalid
  // or
  const errors = this.app.validator.validate({ id: 'id' }, this.request.body);
};
```

### Extend Rules

- app.js

```js
app.validator.addRule('jsonString', (rule, value) => {
  try {
    JSON.parse(value);
  } catch (err) {
    return 'must be json string';
  }
});
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
