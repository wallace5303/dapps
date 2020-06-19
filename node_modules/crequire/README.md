Get require() like node-requires by lexical analysis
===

[![NPM version](https://badge.fury.io/js/crequire.png)](https://npmjs.org/package/crequire)
[![Build Status](https://secure.travis-ci.org/seajs/crequire.png?branch=master)](https://travis-ci.org/seajs/crequire)

changed name from "searequire"


### Installation
```
npm install crequire
```

### Api
* parseDependencies(code:String, callback:Function = null, flag:Boolean = false):String
* parseDependencies(code:String, flag:Boolean = false):String
  * flag means if use "require.async" like, the result should have a property "flag" of ".async"

### Example
js:
```js
require('a');
//require('b');
/require('c')/;
'require("d")';
if(true)/require('e')/;
do /require('f')/.test(s); while(false);
```
parser output:
```js
{
  "string": "require('a')",
  "path": "a",
  "index": 0,
  "flag": null
}
```

### benchmark
```
crequire: normal x 139,605 ops/sec ±5.29% (80 runs sampled)
detective: normal x 38,301 ops/sec ±7.10% (74 runs sampled)
  Fastest is crequire
crequire: reg & comment x 232,023 ops/sec ±0.88% (95 runs sampled)
detective: reg & comment x 72,712 ops/sec ±1.39% (93 runs sampled)
  Fastest is crequire
crequire: after return x 138,280 ops/sec ±1.05% (95 runs sampled)
detective: after return x 17,690 ops/sec ±2.43% (77 runs sampled)
  Fastest is crequire
crequire: in quote x 1,122,979 ops/sec ±1.88% (94 runs sampled)
detective: in quote x 165,281 ops/sec ±5.10% (85 runs sampled)
  Fastest is crequire
crequire: in comment x 1,183,076 ops/sec ±1.21% (95 runs sampled)
detective: in comment x 415,236 ops/sec ±1.42% (97 runs sampled)
  Fastest is crequire
crequire: in multi comment x 1,165,799 ops/sec ±1.29% (88 runs sampled)
detective: in multi comment x 375,485 ops/sec ±1.15% (91 runs sampled)
  Fastest is crequire
crequire: in reg x 879,704 ops/sec ±0.90% (94 runs sampled)
detective: in reg x 118,294 ops/sec ±1.65% (93 runs sampled)
  Fastest is crequire
crequire: in ifstmt with no {} x 311,524 ops/sec ±1.06% (95 runs sampled)
detective: in ifstmt with no {} x 77,100 ops/sec ±1.15% (93 runs sampled)
  Fastest is crequire
crequire: in dostmt with no {} x 150,815 ops/sec ±1.52% (92 runs sampled)
detective: in dostmt with no {} x 47,510 ops/sec ±1.30% (91 runs sampled)
  Fastest is crequire
crequire: reg / reg x 656,564 ops/sec ±0.91% (94 runs sampled)
detective: reg / reg:
  Fastest is crequire
crequire: ignore variable x 270,350 ops/sec ±3.61% (87 runs sampled)
detective: ignore variable x 60,427 ops/sec ±1.29% (91 runs sampled)
  Fastest is crequire
```