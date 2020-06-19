
5.1.3 / 2020-04-29
==================

**fixes**
  * [[`dca1edf`](http://github.com/koajs/static-cache/commit/dca1edf0b641993921b33c0289dbd73ff4bc1c13)] - fix: alias should work when preload = false (#84) (TZ | 天猪 <<atian25@qq.com>>)

5.1.2 / 2018-02-06
==================

**others**
  * [[`ba60f3d`](http://github.com/koajs/static-cache/commit/ba60f3d859e98efd41a625fd0410ff4d930bf37b)] - deps: use ^ (dead-horse <<dead_horse@qq.com>>)
  * [[`82274d0`](http://github.com/koajs/static-cache/commit/82274d02d3601282cb363a2339081393ef2bf83d)] - deps: Update package.json bump debug and mz versions (#73) (Iain Maitland <<imaitland@protonmail.com>>)

5.1.1 / 2017-06-13
==================

  * fix: only load file under options.dir (#67)

5.1.0 / 2017-06-01
==================

  * feat: files support lru (#64)
  * Update mz (#61)

5.0.1 / 2017-04-19
==================

  * Add node.js v7.6.0 support (#58)

5.0.0 / 2017-04-01
==================

  * Support Koa 2 (#57)

4.0.0 / 2017-02-21
==================

  * refactor: check prefix first to avoid calculate (#56)

3.2.0 / 2017-01-07
==================

  * feat: support options.preload (#55)

3.1.7 / 2016-04-07
==================

  * update mz to 2.4.0

3.1.6 / 2016-03-22
==================

  * fix: don't catch downstream error

3.1.5 / 2016-03-02
==================

  * fix: dynamic load file bug on windows platform

3.1.4 / 2016-01-04
==================

  * bump deps
  * use mz

3.1.3 / 2015-11-26
==================

  * Fix broken mtime comparison

3.1.2 / 2015-07-08
==================

  * bugfix: error on dynamic files

3.1.1 / 2015-04-17
==================

  * fix: options.prefix bug in windows, fixes #39

3.1.0 / 2015-03-28
==================

  * Merge pull request #33 from AlexeyKhristov/gz

3.0.3 / 2015-03-28
==================

  * fix problem, cache is not used in dynamic mode

3.0.2 / 2015-03-18
==================

  * fix options.prefix bug in windows, fixes #36

3.0.1 / 2015-01-06
==================

  * feat(dynamic): add dynamic option to support dynamic load
  * fix(dynamic): use stat to detect folder

3.0.0 / 2015-01-06
==================

  * fix(test): typo
  * fix(buffer): keep the old logic of treat unbuffered file
  * feat: add opt.buffer false to serve file not cache at all
  * fix: support load file dynamic, close #30

2.0.2 / 2015-01-05
==================

  * fix normalize bug in windows, fixes #29

2.0.1 / 2014-12-02
==================

  * accept abnormal path, like: //index.html

2.0.0 / 2014-11-14
==================

  * bump koa
  * only response GET and HEAD

1.2.0 / 2014-09-18
==================

  * bump compressible and mime-types
  * decodeURI when use this.path as key to fetch value from files object

1.1.0 / 2014-07-16
==================

  * replace mime by mime-types
  * remove onerror and destroy, let koa hanlde these stuff

1.0.10 / 2014-05-18
==================

  * bump fs-readdir-recursive, fixed #14
  * fix bad argument handling, fixed #20
  * should not return gzip buffer when accept encoding not include gzip

1.0.9 / 2014-03-31
==================

  * add url prefix option

1.0.8 / 2014-03-31
==================

  * support options.dir, default to process.cwd()
  * add vary, check file's length when gzip
  * Ensure files can be gzipped via compressible.

1.0.7 / 2014-03-26
==================

  * add options.gzip to control gzip, support stream's gzip
  * add gzip support for buffers

1.0.3 / 2014-01-14
==================

 * update `on-socket-error`

1.0.0 / 2013-12-21
==================

 * use `yield* next`
