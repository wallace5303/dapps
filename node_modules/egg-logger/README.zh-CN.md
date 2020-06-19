# egg-logger

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-logger.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-logger
[travis-image]: https://img.shields.io/travis/eggjs/egg-logger.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-logger
[codecov-image]: https://codecov.io/github/eggjs/egg-logger/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-logger?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-logger.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-logger
[snyk-image]: https://snyk.io/test/npm/egg-logger/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-logger
[download-image]: https://img.shields.io/npm/dm/egg-logger.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-logger

Egg 的日志工具。

![](diagram.png)

主要由 Logger 和 Transport 两个基类组成。

Transport 是一种写入日志的渠道，可以是终端、文件等等。

Logger 是所有日志的基类，可以进行扩展。一个 Logger 可以添加多个 Transport，只要调用一次就可以将日志写入多个地方。

---

## Install

```bash
$ npm i egg-logger
```

## Usage

创建一个 Logger，添加一个文件的 Transport

```js
const Logger = require('egg-logger').Logger;
const FileTransport = require('egg-logger').FileTransport;
const ConsoleTransport = require('egg-logger').ConsoleTransport;

const logger = new Logger();
logger.set('file', new FileTransport({
  file: '/path/to/file',
  level: 'INFO',
}));
logger.set('console', new ConsoleTransport({
  level: 'DEBUG',
}));
logger.debug('debug foo'); // 不会输出到文件，只输出到终端
logger.info('info foo');
logger.warn('warn foo');
logger.error(new Error('error foo'));
```

### 开启/关闭 Transport

```js
logger.disable('file');
logger.info('info'); // 不会输出
logger.enable('file');
logger.info('info'); // 开启后会输出
```

### 汇集日志

可以把日志复制一份到指定的日志对象，支持可选的 `options.excludes` 来排除对应的 tranport

```js
logger.duplicate('error', errorLogger, { excludes: [ 'console' ] });
logger.error(new Error('print to errorLogger')); // 会多调用一次 `errorLogger.error`
```

### 重定向日志

可以将日志重定向到指定的日志对象

```js
oneLogger.redirect('debug', debugLogger); // oneLogger 的调试日志将被 debugLogger 接管，输出过去。
```

### 重新加载文件

```js
logger.reload(); // will end the exists write stream and create a new one.
```

### 自定义 Transport

可以自定义一个 Transport 用于输出日志，比如发送到服务器。

```js
const urllib = require('urllib');
const Transport = require('egg-logger').Transport;

class UrllibTransport extends Transport {

  log(level, args, meta) {
    const msg = super.log(level, args, meta);
    return urllib.request('url?msg=' + msg);
  }
}

const logger = new Logger();
logger.set('remote', new UrllibTransport({
  level: 'DEBUG',
}));
logger.info('info');
```

## License

[MIT](LICENSE)
