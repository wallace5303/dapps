
2.13.0 / 2020-02-25
==================

**features**
  * [[`c0ba739`](http://github.com/eggjs/egg-scripts/commit/c0ba73900642e488b0e6306ea028ef547ceedfae)] - feat: support stop timeout (#43) (hui <<kangpangpang@gmail.com>>)

2.12.0 / 2019-12-16
==================

**features**
  * [[`20483fd`](http://github.com/eggjs/egg-scripts/commit/20483fd56ce51238431fb095ede1c768a99470f2)] - feat: support eggScriptsConfig in package.json (#41) (Yiyu He <<dead_horse@qq.com>>)

2.11.1 / 2019-10-10
==================

**fixes**
  * [[`de61980`](http://github.com/eggjs/egg-scripts/commit/de61980f772c8a24010d3f078658f8c55b072067)] - fix: start command should exit after child process exit when no daemon mode (#39) (killa <<killa123@126.com>>)

**others**
  * [[`7ae9cb0`](http://github.com/eggjs/egg-scripts/commit/7ae9cb054cb91ea7ac1e615e1e3a7fcdaba5f980)] - test: add egg@1 and egg@2 with travis (#36) (Maledong <<maledong_github@outlook.com>>)

2.11.0 / 2018-12-17
===================

  * feat(stop): only sleep when master process exists (#34)
  * fix: stop process only if the title matches exactly (#35)

2.10.0 / 2018-10-10
==================

**fixes**
  * [[`4768950`](http://github.com/eggjs/egg-scripts/commit/4768950d29398031fd6ae129a981c60e308bff0a)] - fix: replace command by args in ps (#29) (Baffin Lee <<baffinlee@gmail.com>>)

**others**
  * [[`f31efb9`](http://github.com/eggjs/egg-scripts/commit/f31efb9133c5edc6176371ca725198f1b43b9aab)] -  feat: support customize node path (#32) (Yiyu He <<dead_horse@qq.com>>)
  * [[`c2479dc`](http://github.com/eggjs/egg-scripts/commit/c2479dc6416386b654fc6e918a4dbd575cc0639e)] - chore: update version (TZ <<atian25@qq.com>>)

2.9.1 / 2018-08-24
==================

  * fix: replace command by args in ps (#29)

2.9.0 / 2018-08-23
==================

**features**
  * [[`1367883`](http://github.com/eggjs/egg-scripts/commit/1367883804e5ab1ece88831ea4d1a934ee757f81)] - feat: add ipc channel in nonDaemon mode (#28) (Khaidi Chu <<i@2333.moe>>)

**others**
  * [[`262ef4c`](http://github.com/eggjs/egg-scripts/commit/262ef4c97179dbf6f8de2eb0547eef4cbc56bf92)] - chore: add license and issues link (#27) (Haoliang Gao <<sakura9515@gmail.com>>)

2.8.1 / 2018-08-19
==================

**fixes**
  * [[`b98fd03`](http://github.com/eggjs/egg-scripts/commit/b98fd03d1e3aaed68004b881f0b3d42fe47341dd)] - fix: use execFile instead of exec for security reason (#26) (fengmk2 <<fengmk2@gmail.com>>)

2.8.0 / 2018-08-10
==================

**others**
  * [[`dac29f7`](http://github.com/eggjs/egg-scripts/commit/dac29f73ed2dfc18edc2e8743ffd509af8ab0f4a)] - refactor: add `this.exit` to instead of `process.exit` (#25) (Khaidi Chu <<i@2333.moe>>)

2.7.0 / 2018-08-10
==================

**features**
  * [[`22faa4c`](http://github.com/eggjs/egg-scripts/commit/22faa4cfbb84cc5bc819d981dce962d8f95f8357)] - feat: stop command support windows (#22) (Baffin Lee <<baffinlee@gmail.com>>)

**others**
  * [[`e07726c`](http://github.com/eggjs/egg-scripts/commit/e07726c176a89dd63482b588868fd1feaab1fba6)] - refactor: raw spawn call to instead of helper.spawn in start non-daemon mode (#23) (Khaidi Chu <<i@2333.moe>>)

2.6.0 / 2018-04-03
==================

  * feat: provides source map support for stack traces (#19)

2.5.1 / 2018-02-06
==================

  * chore: add description for ignore-stderr (#18)

2.5.0 / 2017-12-12
==================

**features**
  * [[`b5559d5`](http://github.com/eggjs/egg-scripts/commit/b5559d54228543b5422047e6f056829df11f8c87)] - feat: support --ignore-error (#17) (TZ | 天猪 <<atian25@qq.com>>)

2.4.0 / 2017-11-30
==================

**features**
  * [[`8eda3d1`](https://github.com/eggjs/egg-scripts/commit/8eda3d10cfea5757f220fd82b562fd5fef433440)] - feat: add `${baseDir}/.node/bin` to PATH if exists (#14) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`4dd24a4`](https://github.com/eggjs/egg-scripts/commit/4dd24a45d92b2c2a8e1e450e0f13ba4143550ca9)] - test: add testcase for #12 (#13) (Haoliang Gao <<sakura9515@gmail.com>>)

2.3.0 / 2017-11-29
==================

**features**
  * [[`4c41319`](http://github.com/eggjs/egg-scripts/commit/4c41319f9e309402b2ccb5c7afd5a6d3cda2453f)] - feat: support stop --title (#16) (TZ | 天猪 <<atian25@qq.com>>)

2.2.0 / 2017-11-22
==================

**features**
  * [[`ac58d00`](http://github.com/eggjs/egg-scripts/commit/ac58d00a974fdfff6b5c722743e4b32174963c52)] - feat: cwd maybe not baseDir (#15) (zhennann <<zhen.nann@icloud.com>>)

2.1.1 / 2017-11-14
==================

**fixes**
  * [[`7324d99`](http://github.com/eggjs/egg-scripts/commit/7324d99b504cac5fef7dbf280f7d9e6243c16bb7)] - fix: should stop app when baseDir is symlink (#12) (Haoliang Gao <<sakura9515@gmail.com>>)

2.1.0 / 2017-10-16
==================

**features**
  * [[`ac40135`](http://github.com/eggjs/egg-scripts/commit/ac40135d5b9a3200ea1bdfdb19d0f7e12d0c511a)] - feat: add eggctl bin (#10) (Haoliang Gao <<sakura9515@gmail.com>>)

2.0.0 / 2017-10-13
==================

**features**
  * [[`0f7ca50`](http://github.com/eggjs/egg-scripts/commit/0f7ca502999c06a9cb05d8e5617f6045704511df)] - feat: [BREAKING_CHANGE] check the status of app when start on daemon (#9) (Haoliang Gao <<sakura9515@gmail.com>>)

**others**
  * [[`cfd0d2f`](http://github.com/eggjs/egg-scripts/commit/cfd0d2f67845fffb9d5974514b65e43b22ed8040)] - refactor: modify the directory of logDir (#8) (Haoliang Gao <<sakura9515@gmail.com>>)

1.2.0 / 2017-09-11
==================

**features**
  * [[`c0300b8`](http://github.com/eggjs/egg-scripts/commit/c0300b8c657fe4f75ca388061f6cb3de9864a743)] - feat: log success at daemon mode (#7) (TZ | 天猪 <<atian25@qq.com>>)

**others**
  * [[`fdd273c`](http://github.com/eggjs/egg-scripts/commit/fdd273c2d6f15d104288fef4d699627a7cf701d9)] - test: add cluster-config fixture (#4) (TZ | 天猪 <<atian25@qq.com>>)

1.1.2 / 2017-09-01
==================

  * fix: should not pass undefined env (#6)
  * docs: fix stop typo (#5)

1.1.1 / 2017-08-29
==================

  * fix: should set title correct (#3)

1.1.0 / 2017-08-16
==================

  * feat: remove env default value (#2)

1.0.0 / 2017-08-02
==================

  * feat: first implementation (#1)
