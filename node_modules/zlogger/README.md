# zlogger

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/zlogger.svg?style=flat-square
[npm-url]: https://npmjs.org/package/zlogger
[travis-image]: https://img.shields.io/travis/node-modules/zlogger.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/zlogger
[codecov-image]: https://codecov.io/gh/node-modules/zlogger/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/node-modules/zlogger
[david-image]: https://img.shields.io/david/node-modules/zlogger.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/zlogger
[snyk-image]: https://snyk.io/test/npm/zlogger/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/zlogger
[download-image]: https://img.shields.io/npm/dm/zlogger.svg?style=flat-square
[download-url]: https://npmjs.org/package/zlogger

The last console logger

## Installation

```
npm install --save zlogger
```

## Feature

- ✔︎ Extends [Console](https://nodejs.org/api/console.html#console_new_console_stdout_stderr)
- ✔︎ Support custom prefix before every line
- ✔︎ Support custom stdout and stderr
- ✔︎ Support print time
- ✔︎ Support child logger

## Usage

zlogger is same as global `console` which has `.log`, `.info`, `.warn`, `.error`.

Every line will start with `prefix` that you customize.

```js
const logger = new ConsoleLogger({
  prefix: '> ',
});
```

Specify stdout/stderr, default is `process.stdout/process.stderr`, you can use `fs` if you want to print to file.

```js
const logger = new ConsoleLogger({
  stdout: fs.createWriteStream('stdout.log'),
  stderr: fs.createWriteStream('stderr.log'),
});
logger.info('info');
logger.error('error');

// cat stdout.log
// cat stderr.log
```

You can create a child logger, the first argument can be a ChildProcess or writable stream. If you give a prefix, it will print after prefix defined by the parent logger.

```js
const cp = require('child_process');
const logger = new ConsoleLogger({
  prefix: 'prefix > ',
});
logger.info('see directory')

const ls = cp.spawn('ls', { cwd: __dirname });
logger.child(ls, '> ');

// [15:03:46] prefix > see directory
// [15:03:46] prefix > > History.md
// [15:03:46] prefix > > README.md
// [15:03:46] prefix > > index.js
// [15:03:46] prefix > > node_modules
// [15:03:46] prefix > > package.json
// [15:03:46] prefix > > test
```

`.child` will return a new logger.

```js
const logger = new ConsoleLogger({
  prefix: 'parent> ',
});
logger.info('parent');

const child = logger.child('child> ');
child.info('child');

// [15:02:43] parent> parent
// [15:02:43] parent> child> child
```

It will print time before prefix, format is `[HH:MM:SS] `, but you can disable it.

## 参数

- {WriteStream} stdout - stdout, `.log` and `.info` will pipe to it，default is process.stdout
- {WriteStream} stderr - stderr, `.warn` and `.error` will pipe to it，default is process.stderr
- {String|Function} prefix - every line will start with `prefix`, if it's a function, it will be called every line print.
- {Boolean} time - print time

## License

(The MIT License)
