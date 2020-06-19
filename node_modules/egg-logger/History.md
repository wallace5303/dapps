
2.4.2 / 2020-04-14
==================

**others**
  * [[`6fbe6c3`](http://github.com/eggjs/egg-logger/commit/6fbe6c34b7456c683342a51e360f667128afe315)] - chore(typings): add concentrateError to EggLoggerOptions (#62) (scott <<congyuandong@gmail.com>>)
  * [[`a1b6c85`](http://github.com/eggjs/egg-logger/commit/a1b6c85ad13f7fa39dc3fc72029c39604b05cd69)] - chore: update travis (#60) (TZ | 天猪 <<atian25@qq.com>>)

2.4.1 / 2019-03-19
==================

**fixes**
  * [[`d048015`](http://github.com/eggjs/egg-logger/commit/d048015f63dde2917cb51f8f30b87a320b2d892b)] - fix: duplicate should ignore some transports (#45) (TZ | 天猪 <<atian25@qq.com>>)

2.4.0 / 2019-03-14
==================

**features**
  * [[`0cbbe47`](http://github.com/eggjs/egg-logger/commit/0cbbe47efb10897ac55a892bc670d3924a1ddfb5)] - feat: support contextFormatter (#51) (Haoliang Gao <<sakura9515@gmail.com>>)

2.3.2 / 2019-02-28
==================

**fixes**
  * [[`f51216b`](http://github.com/eggjs/egg-logger/commit/f51216bd84d48f75e44ebe2e1208c308d1969dce)] - fix: crash when format a getter-only error stack (#50) (Khaidi Chu <<i@2333.moe>>)

**others**
  * [[`858a8b4`](http://github.com/eggjs/egg-logger/commit/858a8b46495fed21efb4215e36764b3030e573ee)] - chore: comments typo fix (#47) (Jeff <<jeff.tian@outlook.com>>)

2.3.1 / 2019-01-03
==================

  * fix: should not duplicate to console (#43)
  * chore: modify engine version (#42)

2.3.0 / 2019-01-01
==================

**features**
  * [[`22cf355`](http://github.com/eggjs/egg-logger/commit/22cf355d7ae976c8502745a8e8d73748af885637)] - feat: file path support relative path (#41) (TZ | 天猪 <<atian25@qq.com>>)

**others**
  * [[`0262ac2`](http://github.com/eggjs/egg-logger/commit/0262ac204826f1a582bd63273a43cfe86c723ad3)] - chore: fix typo (#40) (Jeff <<jeff.tian@outlook.com>>)

2.2.1 / 2018-12-26
==================

  * fix: logger should extend Map (#39)

2.2.0 / 2018-12-17
==================

**features**
  * [[`d578857`](http://github.com/eggjs/egg-logger/commit/d57885737c4311f17a76713abcd5459523ff92a4)] - feat: support concentrateError and set default to duplicate (#38) (TZ | 天猪 <<atian25@qq.com>>)

2.1.0 / 2018-12-07
==================

**features**
  * [[`e43f70c`](http://github.com/eggjs/egg-logger/commit/e43f70ce6f8b894a110e17384d445edcd44fcff5)] - feat: redirect support `options.duplicate` (#35) (TZ | 天猪 <<atian25@qq.com>>)

2.0.3 / 2018-11-19
==================

**others**
  * [[`6941e1e`](http://github.com/eggjs/egg-logger/commit/6941e1eb0723c907031ea573b08b90e730a99b7c)] - deps: use circular-json-for-egg to remove deprecate message (#33) (Yiyu He <<dead_horse@qq.com>>)

2.0.2 / 2018-10-18
==================

**fixes**
  * [[`1f5684f`](http://github.com/eggjs/egg-logger/commit/1f5684f54a87464748f3acf6699d6fe31e9f4014)] - fix: implicit-any error for EggLoggers#set (#31) (Andy <<anhans@microsoft.com>>)

2.0.1 / 2018-10-09
==================

**others**
  * [[`7a33960`](http://github.com/eggjs/egg-logger/commit/7a33960e9a87de5d693d4628f2f3a7a8de649a33)] - chore: change commemts in english (dead-horse <<dead_horse@qq.com>>)
  * [[`44bd5fa`](http://github.com/eggjs/egg-logger/commit/44bd5fa72fb482dc57f57e2d46150bfa3d72c3cb)] - chore(typings): add LoggerOptions['allowDebugAtProd']: boolean (#28) (waiting <<waiting@xiaozhong.biz>>)

2.0.0 / 2018-10-08
==================

**fixes**
  * [[`0296646`](http://github.com/eggjs/egg-logger/commit/0296646f1dd9f39925ed7e353cc22879ac851a1f)] - fix: don't write when stream is not writable (#30) (Yiyu He <<dead_horse@qq.com>>)

**others**
  * [[`07f3635`](http://github.com/eggjs/egg-logger/commit/07f3635dc05574a926a222b48e4b6d5ec97453e0)] - deps: pin circular-json@0.5.5, update dependencies (#29) (Yiyu He <<dead_horse@qq.com>>)

1.7.1 / 2018-07-09
==================

**fixes**
  * [[`b80560b`](http://github.com/eggjs/egg-logger/commit/b80560b1906ff667db24345029ac8951622ebe59)] - fix: use circular-json to format error properties (#26) (Yiyu He <<dead_horse@qq.com>>)

1.7.0 / 2018-06-21
==================

**features**
  * [[`faf458c`](http://github.com/eggjs/egg-logger/commit/faf458c044b7b49e8aa6cf1d2030111ac58f31ad)] - feat(typings): add typings for egg logger (#24) (Axes <<whxaxes@qq.com>>)

1.6.2 / 2018-04-08
==================

**fixes**
  * [[`4669bbe`](http://github.com/eggjs/egg-logger/commit/4669bbeadded1901320285de0725b3b77da5d52d)] - fix: inspect use breakLength: Infinity (#23) (Yiyu He <<dead_horse@qq.com>>)

1.6.1 / 2017-12-27
==================

**fixes**
  * [[`f0bf7d9`](http://github.com/eggjs/egg-logger/commit/f0bf7d97e269da3ff29f2a6f811f1b48558fbcab)] - fix(transport): should reload write stream when stream get error (#21) (Haoliang Gao <<sakura9515@gmail.com>>)

1.6.0 / 2017-04-28
==================

  * feat: add level getter to Logger and Transport (#19)

1.5.0 / 2016-12-08
==================

  * improve: don't convert utf8 string to buffer (#15)

1.4.1 / 2016-11-11
==================

  * refactor: use .close instead of .end (#12)
  * fix: print to stderr when stream closed (#11)

1.4.0 / 2016-11-02
==================

  * feat: write support util.format (#10)

1.3.0 / 2016-09-21
==================

  * feat: add .unredirect() for logger (#9)
  * use Infinity to improve performance and semantics (#7)

1.2.0 / 2016-08-11
==================

  * feat: remove fileTransport from consoleLogger (#6)

1.1.1 / 2016-08-10
==================

  * fix: add missing write function on context logger (#5)

1.1.0 / 2016-07-27
==================

  * feat: display all error properties (#4)

1.0.1 / 2016-07-09
==================

  * first version
