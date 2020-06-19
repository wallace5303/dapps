egg-ci
---------------

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Build Status](https://dev.azure.com/eggjs/egg/_apis/build/status/eggjs.egg-ci)](https://dev.azure.com/eggjs/egg/_build/latest?definitionId=3)
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-ci.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-ci
[travis-image]: https://img.shields.io/travis/eggjs/egg-ci.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-ci
[codecov-image]: https://codecov.io/github/eggjs/egg-ci/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-ci?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-ci.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-ci
[download-image]: https://img.shields.io/npm/dm/egg-ci.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-ci

Auto gen ci config file.

## Installation

```bash
$ npm i egg-ci --save-dev
```

## Usage

Add `ci` property to your `package.json`:

```js
"ci": {
  "type": "travis, appveyor", // default ci env type is 'travis, appveyor', also support 'azure-pipelines'
  "os": {
    "travis": "linux", // travis support 'linux', 'osx' and 'windows' operation system, default is 'linux'
    "azure-pipelines": "linux, windows, macos", // azure-pipelines support 'linux, windows, macos', default is 'linux, windows, macos'
    "github": "linux, windows, macos"
  },
  "npminstall": true, // use `npminstall` or `npm install`, default is true
  "version": "8, 10, 12", // test LTS node version by default
  // npm ci command
  "command": {
    "travis": "ci",
    "appveyor": "test",
    "azure-pipelines": "ci",
    "github": "ci"
  },
  "services": "redis-server, mysql", // custom service
  "license": false // generate license
}
```

## How

Use `npm postinstall` hook to create the `*.yml` after each `npm install` run.

## License

[MIT](LICENSE)
