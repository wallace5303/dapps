# tcp-base
A base class for tcp client with basic functions

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/tcp-base.svg?style=flat-square
[npm-url]: https://npmjs.org/package/tcp-base
[travis-image]: https://img.shields.io/travis/node-modules/tcp-base.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/tcp-base
[codecov-image]: https://codecov.io/gh/node-modules/tcp-base/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/node-modules/tcp-base
[david-image]: https://img.shields.io/david/node-modules/tcp-base.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/tcp-base
[snyk-image]: https://snyk.io/test/npm/tcp-base/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/tcp-base
[download-image]: https://img.shields.io/npm/dm/tcp-base.svg?style=flat-square
[download-url]: https://npmjs.org/package/tcp-base

## Install

```bash
$ npm install tcp-base --save
```

Node.js >= 6.0.0 required

## Usage 

A quick guide to implement a tcp echo client

Client:
```js
'use strict';

const TCPBase = require('tcp-base');

/**
 * A Simple Protocol:
 *   (4B): request id
 *   (4B): body length
 *   ------------------------------
 *   body data
 */
class Client extends TCPBase {
  getHeader() {
    return this.read(8);
  }

  getBodyLength(header) {
    return header.readInt32BE(4);
  }

  decode(body, header) {
    return {
      id: header.readInt32BE(0),
      data: body,
    };
  }

  // heartbeat packet
  get heartBeatPacket() {
    return new Buffer([ 255, 255, 255, 255, 0, 0, 0, 0 ]);
  }
}

const client = new Client({
  host: '127.0.0.1',
  port: 8080,
});

const body = new Buffer('hello');
const data = new Buffer(8 + body.length);
data.writeInt32BE(1, 0);
data.writeInt32BE(body.length, 4);
body.copy(data, 8, 0);

client.send({
  id: 1,
  data,
  timeout: 5000,
}, (err, res) => {
  if (err) {
    console.error(err);
  }
  console.log(res.toString()); // should echo 'hello'
});
```

Server:
```js
'use strict';

const net = require('net');

const server = net.createServer(socket => {
  let header;
  let bodyLen;

  function readPacket() {
    if (bodyLen == null) {
      header = socket.read(8);
      if (!header) {
        return false;
      }
      bodyLen = header.readInt32BE(4);
    }

    if (bodyLen === 0) {
      socket.write(header);
    } else {
      const body = socket.read(bodyLen);
      if (!body) {
        return false;
      }
      socket.write(Buffer.concat([ header, body ]));
    }
    bodyLen = null;
    return true;
  }

  socket.on('readable', () => {
    try {
      let remaining = false;
      do {
        remaining = readPacket();
      }
      while (remaining);
    } catch (err) {
      console.error(err);
    }
  });
});
server.listen(8080);
```

[MIT](LICENSE)