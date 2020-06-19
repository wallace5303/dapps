# tcp-proxy.js

A TCP Proxy package for NodeJS

[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Appveyor status][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]

[npm-image]: https://img.shields.io/npm/v/tcp-proxy.js.svg?style=flat-square
[npm-url]: https://npmjs.org/package/tcp-proxy.js
[travis-url]: https://travis-ci.org/whxaxes/tcp-proxy.js
[travis-image]: http://img.shields.io/travis/whxaxes/tcp-proxy.js.svg
[appveyor-url]: https://ci.appveyor.com/project/whxaxes/tcp-proxy.js/branch/master
[appveyor-image]: https://ci.appveyor.com/api/projects/status/github/whxaxes/tcp-proxy.js?branch=master&svg=true
[coveralls-url]: https://coveralls.io/r/whxaxes/tcp-proxy.js
[coveralls-image]: https://img.shields.io/coveralls/whxaxes/tcp-proxy.js.svg

## Usage

```bash
$ npm i tcp-proxy.js --save
```

### Create a new proxy instance

```js
const TCPProxy = require('tcp-proxy.js');
const proxy = new TCPProxy({ port: 9229 });
proxy.createProxy({
  forwardPort: 9999,
  forwardHost: 'localhost',
});
```

### Create a new proxy instance for a specific IP/Hostname
This will only listen to connections on the specified IP/Hostname, you can have duplicates of ports this way.

```js
const TCPProxy = require('tcp-proxy.js');
const proxy = new TCPProxy({ host: 'localhost', port: 9229 });
proxy.createProxy({
  forwardPort: 9999,
  forwardHost: 'localhost',
});
```

### End proxy

```js
proxy.end();
```

### Interceptor

```js
proxy.createProxy({
  forwardPort: 9999,
  interceptor: {
    client(chunk) {
      // request => proxy server => interceptor.client => forward server
      const data = chunk.toString();
      const newData = data.replace('GET / ', 'GET /tom ');
      return Buffer.from(newData);
    },
    server(chunk) {
      // forward server => interceptor.server => proxy server => response
      const data = chunk.toString();
      const newData = data.replace('hello tom', 'bello tom');
      return Buffer.from(newData);
    },
  },
});
```

### Async Interceptor

```js
proxy.createProxy({
  forwardPort: 9999,
  interceptor: {
    client(chunk) {
      // request => proxy server => interceptor.client => forward server
      const data = chunk.toString();
      return new Promise(resolve => {
        setTimeout(() => {
          const newData = data.replace('GET / ', 'GET /tom ');
          resolve(Buffer.from(newData));
        }, 200);
      });
    },
  },
});
```


### Connection Information

#### IP, Port of Client, Server and Self

```js
proxy.createProxy({
  forwardPort: 9999,
  interceptor: {
    client(result, encoding, connection) {
      console.info('Connection from ', connection.client.ip, ':', connection.client.port, 'to', connection.self.ip, ':', connection.self.port, 'from', connection.server.ip, ':', connection.server.port);
      return result
    }
  },
});
```

#### Data size

```js
proxy.createProxy({
  forwardPort: 9999,
  interceptor: {
    server(result, encoding, connection) {
      console.log('Connection Size:' + connection.size);
      return result
    }
  },
});
```

## License

MIT
