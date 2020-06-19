egg-ci
---------------

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
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

自动生成持续集成配置文件

## 安装

```bash
$ npm i egg-ci --save-dev
```

## 用法

在 `package.json` 中添加如下配置：

```js
"ci": {
  "type": "travis, appveyor", // 默认的集成环境是 'travis, appveyor'，还支持 'azure-pipelines'
  "os": {
    "travis": "", // 支持 'linux, osx, windows' 三种操作系统，默认是 'linux'
    "azure-pipelines": "linux, windows, macos", // 支持 'linux, windows, macos' 三种操作系统，默认是 'linux, windows, macos'
    "github": "linux, windows, macos"
  },
  "npminstall": true, // 是否使用 `npminstall`, 默认为 true
  "version": "10, 12", // 指定 Node 版本。 默认为 LTS 版本。
  // npm ci command
  "command": {
    "travis": "ci",
    "appveyor": "test",
    "azure-pipelines": "ci"
  },
  "services": "redis-server, mysql", // 自定义服务配置
  "license": false // 生成 license
}
```

## 原理

利用了 `npm postinstall` 的钩子，在每次执行 `npm install` 时生成 `*.yml` 配置文件。

## License

[MIT](LICENSE)
