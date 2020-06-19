
3.6.4 / 2019-06-12
==================

**fixes**
  * [[`b6b17b0`](http://github.com/eggjs/egg-schedule/commit/b6b17b032582dbde6f4f9faecef3dd662726b3e2)] - fix: should use template literal (#49) (Jedmeng <<roy.urey@gmail.com>>)

3.6.3 / 2019-06-03
==================

**fixes**
  * [[`bce393f`](http://github.com/eggjs/egg-schedule/commit/bce393f66f70add9151155d16b90942bab75e89b)] - fix: wrap task should always return promise (#48) (TZ | 天猪 <<atian25@qq.com>>)

3.6.2 / 2019-04-29
==================

**fixes**
  * [[`98a0cf7`](http://github.com/eggjs/egg-schedule/commit/98a0cf78012bd138cd8b0893c1acb6527cfecf0e)] - fix: runSchedule should pass args (#47) (TZ | 天猪 <<atian25@qq.com>>)

**others**
  * [[`77fc7d3`](http://github.com/eggjs/egg-schedule/commit/77fc7d3b46d1c57acc69cb3931241f9cb8165a38)] - docs: fix ctx ref (#46) (祝传鹏 <<Luomusha@gmail.com>>)

3.6.1 / 2019-03-20
==================

**others**
  * [[`0960ff8`](http://github.com/eggjs/egg-schedule/commit/0960ff8f058c2bbb8ad2afb333bc557d719ec99b)] - chore: use relative log path (#45) (TZ | 天猪 <<atian25@qq.com>>)

3.6.0 / 2018-12-18
==================

**features**
  * [[`2c64d3c`](https://github.com/eggjs/egg-schedule/commit/2c64d3c6dd386dedaa784180ebb6c61b89fd1d53)] - feat: support custom directory (#43) (TZ <<atian25@qq.com>>)

3.5.0 / 2018-12-05
==================

**features**
  * [[`1aaf2d5`](http://github.com/eggjs/egg-schedule/commit/1aaf2d5675253d125eacca8bfd77813ecc151d2a)] - feat: support custom directory (#43) (Haoliang Gao <<sakura9515@gmail.com>>)

**fixes**
  * [[`4dbf9d9`](http://github.com/eggjs/egg-schedule/commit/4dbf9d9d3785b19eb772704c724c421e1017922a)] - fix: unit-test in 'schedule.test.js' (#41) (Maledong <<maledong_github@outlook.com>>)

**others**
  * [[`571bf9f`](http://github.com/eggjs/egg-schedule/commit/571bf9f28ed229f957fa70067786061a89dc1049)] - doc: Add notice for the evil 'setInterval' (#42) (Maledong <<maledong_github@outlook.com>>)
  * [[`07e4e23`](http://github.com/eggjs/egg-schedule/commit/07e4e238f198fbf935ac5e7fff279f349e11a6b5)] - docs: fix example in readme (cwtuan <<cwtuan@users.noreply.github.com>>)

3.4.0 / 2018-06-30
==================

**features**
  * [[`417a764`](http://github.com/eggjs/egg-schedule/commit/417a7643807e56a432703e64f76923b60e1053ba)] - feat: support `schedule.env` (#39) (TZ | 天猪 <<atian25@qq.com>>)

3.3.0 / 2018-02-24
==================

  * feat: optimize logger msg (#38)

3.2.1 / 2018-02-07
==================

  * chore: fix doctools (#37)

3.2.0 / 2018-02-06
==================

**features**
  * [[`2003369`](http://github.com/eggjs/egg-schedule/commit/200336963cdf2404b926fa1c36223c41229cf32d)] - feat: egg-schedule.log && support send with args (#35) (TZ | 天猪 <<atian25@qq.com>>)

3.1.1 / 2017-11-20
==================

**fixes**
  * [[`9ff3974`](http://github.com/eggjs/egg-schedule/commit/9ff3974683e1f4ade72ccbe2448a3c68d7826530)] - fix: use ctx.coreLogger to record schedule log (#34) (Yiyu He <<dead_horse@qq.com>>)

3.1.0 / 2017-11-16
==================

**features**
  * [[`69a588e`](https://github.com/eggjs/egg-schedule/commit/69a588e5ffbb5a01ed3084bfb9f6c2a792963db4)] - feat: run a scheduler only once at startup (#33) (zhennann <<zhen.nann@icloud.com>>)

3.0.0 / 2017-11-10
==================

**others**
  * [[`925f1c3`](http://github.com/eggjs/egg-schedule/commit/925f1c38ffb5c8d73e91fe96e6e7fc30c3f43c5f)] - refactor: remove old stype strategy support [BREAKING CHANGE] (#29) (TZ | 天猪 <<atian25@qq.com>>)
  * [[`4cdfa20`](http://github.com/eggjs/egg-schedule/commit/4cdfa204f1da36288328bf30acb0564da1e3d1b5)] - test: change to extend Subscription (#28) (TZ | 天猪 <<atian25@qq.com>>)

2.6.0 / 2017-10-16
==================

**features**
  * [[`f901df4`](http://github.com/eggjs/egg-schedule/commit/f901df4e895d440c9d3bc96e172d3cc87be95255)] - feat: Strategy interface change to start() (#26) (TZ | 天猪 <<atian25@qq.com>>)
  * [[`c7816f2`](http://github.com/eggjs/egg-schedule/commit/c7816f2eb8ca668c92c1671b1d149c78dd73551e)] - feat: support class (#25) (Haoliang Gao <<sakura9515@gmail.com>>)

**others**
  * [[`8797489`](http://github.com/eggjs/egg-schedule/commit/8797489f914a34bf56ecc68575b0b7e490628b5a)] - docs: use subscription (#27) (Haoliang Gao <<sakura9515@gmail.com>>)

2.5.1 / 2017-10-11
==================

  * fix: publish files (#24)

2.5.0 / 2017-10-11
==================

  * refactor: classify (#23)
  * test: sleep after runSchedule (#22)

2.4.1 / 2017-06-06
==================

  * fix: use safe-timers only large than interval && add tests (#21)

2.4.0 / 2017-06-05
==================

  * feat: use safe-timers to support large delay (#19)

2.3.1 / 2017-06-04
==================

  * docs: fix License url (#20)
  * test: fix test on windows (#18)
  * chore: upgrade all deps (#17)

2.3.0 / 2017-02-08
==================

  * feat: task support async function (#13)
  * test: move app.close to afterEach (#12)
  * chore: upgrade deps and fix test (#11)

2.2.1 / 2016-10-25
==================

  * fix: start schedule after egg-ready (#10)

2.2.0 / 2016-09-29
==================

  * feat: export app.schedules (#9)
  * doc:fix plugin.js config demo (#8)

2.1.0 / 2016-08-18
==================

  * refactor: use FileLoader to load schedule files (#7)

2.0.0 / 2016-08-16
==================

  * Revert "Release 1.1.1"
  * refactor: use loader.getLoadUnits from egg-core (#6)

1.1.0 / 2016-08-15
==================

  * docs: add readme (#5)
  * feat: support immediate (#4)

1.0.0 / 2016-08-10
==================

  * fix: correct path in ctx (#3)

0.1.0 / 2016-07-26
==================

  * fix: use absolute path for store key (#2)
  * test: add test cases (#1)

0.0.1 / 2016-07-15
==================

  * init
