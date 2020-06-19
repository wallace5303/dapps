# serialize-json
A serialize algorithm for JSON

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/serialize-json.svg?style=flat-square
[npm-url]: https://npmjs.org/package/serialize-json
[travis-image]: https://img.shields.io/travis/node-modules/serialize-json.svg?style=flat-square
[travis-url]: https://travis-ci.org/node-modules/serialize-json
[codecov-image]: https://codecov.io/gh/node-modules/serialize-json/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/node-modules/serialize-json
[david-image]: https://img.shields.io/david/node-modules/serialize-json.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/serialize-json
[snyk-image]: https://snyk.io/test/npm/serialize-json/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/serialize-json
[download-image]: https://img.shields.io/npm/dm/serialize-json.svg?style=flat-square
[download-url]: https://npmjs.org/package/serialize-json

## Introduction

- Support serialize JSON to Buffer, and deserialize Buffer to JSON
  - [√] Boolean
  - [√] String
  - [√] Number
  - [√] Null
  - [√] Undefined
  - [√] Date
  - [√] Buffer
  - [√] Error
  - [√] Plain Object
  - [×] Function
  - [×] RegExp
  - [×] Symbol

- Inspire by [jsonpack](https://github.com/sapienlab/jsonpack), it can compress to 55% of original size if the data has a recursive structure

## Install

```bash
$ npm install serialize-json --save
```

Node.js >= 4.0.0 required

## Usage

```js
let json = {
  a: 'a',
  b: 123,
  c: 123.456,
  d: [ 1, 2, 3 ],
  e: true,
  f: null,
  g: undefined,
  h: new Date(),
  i: new Buffer('this is a buffer'),
  j: new Error('this is a error'),
};
const buf = JSON.encode(json);
const result = JSON.decode(buf);
assert.deepEqual(result, json);
```

## API

- `encode(json)` serialize a json object
- `decode(buf)` deserialize a buffer to json

