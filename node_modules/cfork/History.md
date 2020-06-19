
1.8.0 / 2019-06-13
==================

**features**
  * [[`769a682`](http://github.com/node-modules/cfork/commit/769a6820dc62768ccbc66696e489c0661cd5acdb)] - feat: add cluster windowsHide support (#113) (QingDeng <<zrl412@163.com>>)

**others**
  * [[`178c391`](http://github.com/node-modules/cfork/commit/178c39195066fcf0698602b5b603026e9b9c5005)] - docs: add windowsHide (dead-horse <<dead_horse@qq.com>>)

1.7.1 / 2017-11-07
==================

**fixes**
  * [[`3759155`](http://github.com/node-modules/cfork/commit/3759155234876d740d60d838e2583ca0d74aa7e3)] - fix: log should be info rather than error (#111) (Haoliang Gao <<sakura9515@gmail.com>>)

1.7.0 / 2017-09-25
==================

**features**
  * [[`9fb55a1`](http://github.com/node-modules/cfork/commit/9fb55a10f62b1da6fd7da9ac59178dd0e3a32d67)] - feat: allow master disable worker refork (#110) (fengmk2 <<fengmk2@gmail.com>>)

1.6.1 / 2017-06-11
==================

  * fix:  try to use exitedAfterDisconnect first (#109)
  * chore: update badge

1.6.0 / 2016-11-18
==================

  * feat: Add environment variables support for workers (#100)
  * chore: fix eslint2 removed rules and spelling error (#90)

1.5.1 / 2016-06-23
==================

  * fix: add more debug log (#74)

1.5.0 / 2016-05-06
==================

  * feat: add execArgv support
  * test: add 5, 4 node

1.4.0 / 2015-11-04
==================

 * test(slave): add slave die and refork test case
 * feat: add slave process support
 * chore: fix `npm run autod`

1.3.1 / 2015-08-31
==================

 * fix: add options.autoCoverage to enable istanbul

1.3.0 / 2015-08-30
==================

 * feat: support code coverage with istanbul

1.2.4 / 2015-06-03
==================

 * fix: err maybe undefined

1.2.3 / 2015-05-09
==================

 * test: Add iojs and node v0.12 into travis config
 * fix: when worker has terminated before disconnect, don't fork (@JacksonTian)

1.2.2 / 2014-11-06
==================

 * refactor: ignore undefined
 * pick of meaningful options to setupMaster

1.2.1 / 2014-11-01
==================

 * feat: support args and slient

1.2.0 / 2014-09-27
==================

 * add limit for refork times in certain duration (@coderhaoxin)

1.1.1 / 2014-09-17
==================

 * Fix unexpectedExit event listeners length (@JacksonTian)

1.1.0 / 2014-08-08
==================

 * defer add listenners, add options.refork, optional unexpectedExit event (@dead-horse)

1.0.1 / 2014-08-04
==================

 * improve disconnect and unexpected exit log

1.0.0 / 2014-08-04
==================

 * work with graceful
 * first release
