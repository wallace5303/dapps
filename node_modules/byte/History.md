
2.0.0 / 2018-05-16
==================

**features**
  * [[`dc4f5a6`](http://github.com/node-modules/byte/commit/dc4f5a6cfcf2d48bbe6baa8a8640a5111ea66a76)] - feat: stop supporting node <= 8 (#35) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

1.4.1 / 2018-05-15
==================

**fixes**
  * [[`ccc6f4b`](http://github.com/node-modules/byte/commit/ccc6f4b206d01761c38ca2717014b646ce8f4c93)] - fix: using Buffer.alloc(size) instead of new Buffer(size) (#34) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

1.4.0 / 2018-01-30
==================

**features**
  * [[`2f29793`](http://github.com/node-modules/byte/commit/2f2979376256dd7deae4cc312c4dd019e1ab13ea)] - feat: add memcpy() (#32) (Khaidi Chu <<i@2333.moe>>)

1.3.0 / 2017-11-16
==================

**features**
  * [[`8dd202f`](http://github.com/node-modules/byte/commit/8dd202f06fba076169b9ff3231e65cfc21140555)] - feat: support get raw string by string length (#30) (Yiyu He <<dead_horse@qq.com>>)

**others**
  * [[`7dd0a0c`](http://github.com/node-modules/byte/commit/7dd0a0c7dda5a0c3e5bf49b3449767e69dfc43b5)] - chore: remove duplicated commits on History.md (fengmk2 <<fengmk2@gmail.com>>)

1.2.0 / 2017-08-04
==================

**features**
  * [[`2a052c5`](http://github.com/node-modules/byte/commit/2a052c55c065120a508c98e4595bc11f0c96275a)] - feat: improve putRawString performance (#27) (fengmk2 <<fengmk2@gmail.com>>)

1.1.6 / 2017-05-11
==================

  * refactor: enhance ByteBuffer.get performance

1.1.5 / 2015-09-28
==================

  * fix: getRawString emoji

1.1.4 / 2015-07-21
==================

 * Fix the bug of allocating insufficient space (@pmq20)
 * Invoke _checkSize when index is provided

1.1.3 / 2015-07-01
==================

 * fix: putRawString emoji

1.1.2 / 2015-05-22
==================

 * deps: upgrade debug, long, utility

1.1.1 / 2014-10-23
==================

 * fix bugs: buffer copy (@gxcsoccer)

1.1.0 / 2014-10-18
==================

 * add missing methods (@gxcsoccer)

1.0.0 / 2014-08-27
==================

 * add optimized for numbers
 * refact put
 * refactor putChar
 * optimize put, putChar
 * add 0.11.13 benchmark result
 * add test ubffer slice and copy in node 0.10.28
 * add write int and fill byte benchmark
 * add more benchmarks

0.3.1 / 2014-05-15
==================

  * Merge pull request #9 from node-modules/array-as-copy
  * exports copy bytes, support copy(start, end)

0.3.0 / 2014-05-13
==================

 * add more buffer copy test cases
 * array() must always copy. close #8
 * improve getString performance
 * return this on putNumber*
 * fix putLong convert
 * support auto change save string long to number
 * add test for putString
 * add test for put buffer string
 * improve getString, getRawString
 * improve putString
 * add putBufString benchmark
 * improve putRawString
 * improve performance
 * use ~ for deps
 * fix jshint
 * fix benchmark string
 * add test for fastSlice
 * add benchmark for string, use _fastSlice
 * remove dynamic method name

0.2.3 / 2014-05-07 
==================

  * remove annoying warn

0.2.2 / 2014-04-22
==================

 * use taobao npm
 * use instanbul and jshint
 * use n.high and n.low to check Long instance, because long module will be diff in the top project

0.2.1 / 2014-02-08 
==================

  * Support (U)Int8 8 bit int

0.2.0 / 2014-01-25 
==================

  * add test for rawString (@dead-horse)
  * add rawString methods (@dead-horse)

0.1.3 / 2014-01-23 
==================

  * update authors
  * add test for uint, uint16
  * refactor put and get number of bytes (@dead-horse)
  * install from cnpm

0.1.2 / 2013-11-14 
==================

  * add read(size)

0.1.1 / 2013-11-14 
==================

  * handle empty string

0.1.0 / 2013-11-14 
==================

  * add getString() and putString()
  * add ByteBuffer.wrap()
  * add ByteBuffer get*()

0.0.2 / 2013-11-13 
==================

  * add warnning when buffer reallocate

0.0.1 / 2013-11-13 
==================

  * add benchmark
  * add putInt(), putChar(), putDouble(), put*()
  * update readme
  * first commit
