
2.5.0 / 2019-03-06
==================

**features**
  * [[`c204c5e`](http://github.com/node-modules/mm/commit/c204c5e91eb4f2cb7263cd010293f966dc555808)] - feat: support mock error once (#45) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`2cb2baf`](http://github.com/node-modules/mm/commit/2cb2bafac4344c926cbd3eb60ab2bbde3ebd4ca7)] - test: run test on macos on azure-pipelines (#44) (fengmk2 <<fengmk2@gmail.com>>)

2.4.1 / 2018-08-27
==================

  **fixes**
  * [[`58eb437`](https://github.com/node-modules/mm/commit/58eb4370e6f6cd5d671799c13ba1e93e759afe2f)] - fix: typpings error (#43) (whxaxes <<whxaxes@gmail.com>>)

2.4.0 / 2018-08-08
==================

**others**
  * [[`6a84a0a`](http://github.com/node-modules/mm/commit/6a84a0a9c01a8e68e08eb63b4d587b73cb8fd74a)] - refactor(tsd): use Interface Function Type so that egg-mock can extends this; (#42) (paranoidjk <<hust2012jiangkai@gmail.com>>)

2.3.0 / 2018-08-07
==================

**features**
  * [[`ea75ed5`](http://github.com/node-modules/mm/commit/ea75ed594e776e6acbbbd8a769256973ba4a9ce5)] - feat: add .d.ts (#41) (paranoidjk <<hust2012jiangkai@gmail.com>>)

2.2.2 / 2018-07-12
==================

**fixes**
  * [[`2cd32f9`](http://github.com/node-modules/mm/commit/2cd32f951e3881fd6cdd1768d54b015ced82860c)] - fix: mock http error response need socket (#40) (Yiyu He <<dead_horse@qq.com>>)

2.2.1 / 2018-07-11
==================

**fixes**
  * [[`721dc6b`](http://github.com/node-modules/mm/commit/721dc6b533d6ef148f09e708d1ab2230115cce14)] - fix: support node 10 on https (#39) (fengmk2 <<fengmk2@gmail.com>>)

2.2.0 / 2017-09-07
==================

**features**
  * [[`72e5478`](http://github.com/node-modules/mm/commit/72e54784c5c0c094da6c345ce65f50bbc31b5889)] - feat: use stream class to replace EventEmitter. (Qi Yu <<njuyuqi@gmail.com>>)

**others**
  * [[`eb0eaae`](http://github.com/node-modules/mm/commit/eb0eaae30989298988c1ea8f0024158dcc367ba2)] - test: add mock request pipe test case (fengmk2 <<fengmk2@gmail.com>>)

2.1.1 / 2017-09-06
==================

**fixes**
  * [[`ea1194c`](http://github.com/node-modules/mm/commit/ea1194c2c5fc34ee74c6a33776495ec2f8545f16)] - fix: should support http request mock on node8 (#38) (fengmk2 <<fengmk2@gmail.com>>)
  * [[`007f053`](http://github.com/node-modules/mm/commit/007f053117bb11c3789d545c4ccd50e2a8237fd5)] - fix: README typo (#32) (HC Chen <<chceyes@gmail.com>>)

**others**
  * [[`0e818e3`](http://github.com/node-modules/mm/commit/0e818e3f6d977a07b43db03fa9735de5e8115612)] - test: fix test on node4 (#33) (Haoliang Gao <<sakura9515@gmail.com>>)

2.1.0 / 2017-01-25
==================

  * deps: use muk-prop instead of muk (#30)

2.0.1 / 2017-01-22
==================

  * fix: Only restore the http/https request when used.

2.0.0 / 2016-07-31
==================

  * feat: upgrade dependencies (#29)

1.5.1 / 2016-07-21
==================

  * fix: keep status code (#28)

1.5.0 / 2016-06-13
==================

  * feat: export isMocked (#27)

1.4.0 / 2016-06-12
==================

  * deps: upgrade muk (#26)
  * feat: remove EventEmitter from 'event' module

1.3.5 / 2015-09-29
==================

 * fix: should support mock multi env

1.3.4 / 2015-09-24
==================

 * test: use codecov.io
 * feat: support mock process.env.KEY

1.3.3 / 2015-09-17
==================

 * deps: upgrade muk to 0.4.0 to support mock getter

1.3.2 / 2015-09-17
==================

 * fix: deps muk 0.3.2

1.3.1 / 2015-08-31
==================

  * hotfix: fix mm.error in es6

1.3.0 / 2015-08-22
==================

 * readme: add sync methods and error properties
 * feat: mock error support props
 * chore: use npm scripts

1.2.0 / 2015-08-16
==================

 * feat(sync): add sync mock methods

1.1.0 / 2015-05-08
==================

 * feat: support promise

1.0.1 / 2014-10-30
==================

 * still thunkify the methods

1.0.0 / 2014-10-30
==================

 * docs(readme): add badges
 * feat(error): support mock error on generator function
 * feat(data): support mock generator function

0.2.1 / 2014-03-14
==================

  * if coveralls crash, dont break the test pass
  * fix http request mock not work on 0.11.12 and no more test on 0.8.x

0.2.0 / 2014-02-21
==================

  * support thunkify cnpm/cnpmjs.org#196

0.1.8 / 2013-12-27
==================

  * fix Node 0.11 broken. (@alsotang)
  * fix test cases

0.1.7 / 2013-11-20
==================

  * http.request mock support mm.http.request({host: $host, url: $url})
  * add npm image

0.1.6 / 2013-07-04
==================

  * update muk to 0.3.1, it had fixed https://github.com/fent/node-muk/pull/2 bug

0.1.5 / 2013-07-03
==================

  * hot fixed #5 mock same method twices restore fails bug
  * add test for fs.readFileSync. fixed #5
  * support coveralls

0.1.4 / 2013-05-21
==================

  * use blanket instead of jscover
  * fixed spawn test fail on node 0.6
  * support emtpy error

0.1.3 / 2013-05-05
==================

  * Merge pull request #3 from dead-horse/support-spawn
  * do not emit when null
  * add support for spawn

0.1.2 / 2013-04-20
==================

  * fix mm.datas
  * update travis

0.1.1 / 2013-04-15
==================

  * update muk to 0.3.0+

0.1.0 / 2012-12-01
==================

  * fixed restore not effect on http(s)

0.0.9 / 2012-11-28
==================

  * add request() mock statusCode

0.0.8 / 2012-11-27
==================

  * add mm.datas(), mm.data(), mm.empty() mock methods

0.0.7 / 2012-11-26
==================

  * try to find callback in arguments
  * fixed CERT_HAS_EXPIRED with `rejectUnauthorized = false`

0.0.6 / 2012-11-21
==================

  * fix http.request() twice bug; add res.setEncoding method

0.0.5 / 2012-11-21
==================

  * fixed #1 support mm.https.request mock helpers

0.0.4 / 2012-11-13
==================

  * add mm() just like muk() does

0.0.3 / 2012-11-06
==================

  * add req.abort() for mock request object

0.0.2 / 2012-11-06
==================

  * when mock response error, must emit `req` error not `res` error event.
  * replace logo

0.0.1 / 2012-11-04
==================

  * add mock http.request() and http.requestError()
  * add mm.error() impl
  * Release 0.0.1

