
3.25.1 / 2020-01-17
==================

**fixes**
  * [[`51ef091`](http://github.com/eggjs/egg-mock/commit/51ef091cbb06ae74ff7f9591e3071db648ba5346)] - fix: backgroundTasksFinished ensure all tasks finished (#115) (Yiyu He <<dead_horse@qq.com>>)

3.25.0 / 2019-12-12
==================

**features**
  * [[`4c31c9e`](http://github.com/eggjs/egg-mock/commit/4c31c9e2917eea449e2afddf96fc8d2aabe6ad5e)] - feat: support init hook before mock app init (#109) (TZ | 天猪 <<atian25@qq.com>>)

**fixes**
  * [[`cbab52a`](http://github.com/eggjs/egg-mock/commit/cbab52a697e6e47abd48ce45320b7c40a0463c12)] - fix: enable sendRandom() method in unittest (#114) (GoodMeowing <<36814673+GoodMeowing@users.noreply.github.com>>)

3.24.2 / 2019-11-07
==================

**fixes**
  * [[`3bf5ded`](http://github.com/eggjs/egg-mock/commit/3bf5ded501608f2b5b3199d8b3d0ca0329dd9df7)] - fix: mockLog don't read file (#113) (Yiyu He <<dead_horse@qq.com>>)

3.24.1 / 2019-09-30
==================

**fixes**
  * [[`bd305d2`](http://github.com/eggjs/egg-mock/commit/bd305d21bd54395e597f3fce06758fcbb99ba43f)] - fix: single mode will call app.agent.close (#108) (TZ | 天猪 <<atian25@qq.com>>)

3.24.0 / 2019-09-26
==================

**features**
  * [[`315e685`](http://github.com/eggjs/egg-mock/commit/315e685d2059ec61e62e9109da8b58f9bf5552cd)] - feat: support app.notExpectLog() (#107) (fengmk2 <<fengmk2@gmail.com>>)

3.23.2 / 2019-09-10
==================

**fixes**
  * [[`e494325`](http://github.com/eggjs/egg-mock/commit/e494325562b84876a96062fd061ab4f8c7787a2e)] - fix: mockHttpclient with multi-request (#106) (吖猩 <<whx89768@alibaba-inc.com>>)
  * [[`d836536`](http://github.com/eggjs/egg-mock/commit/d8365368e2339f25874a7dfc1c573249ae841e8f)] - fix: fix httpRequest function signature (#105) (Colin Cheng <<zbinlin@gmail.com>>)

3.23.1 / 2019-05-20
==================

**fixes**
  * [[`6be0c43`](http://github.com/eggjs/egg-mock/commit/6be0c431ee1fd651c4f0bb6f433d7c4444b74708)] - fix: rimraf (#104) (TZ | 天猪 <<atian25@qq.com>>)

3.23.0 / 2019-05-20
==================

**features**
  * [[`9ada7f0`](http://github.com/eggjs/egg-mock/commit/9ada7f004def359a0b17f3824cea946abe4ed1f2)] - feat: mockHttpclient support fn (#103) (TZ | 天猪 <<atian25@qq.com>>)

3.22.4 / 2019-05-06
==================

**fixes**
  * [[`478581a`](http://github.com/eggjs/egg-mock/commit/478581a7851d19286c4e689af421a70cae27d26d)] - fix: remove egg-core deps (#101) (TZ | 天猪 <<atian25@qq.com>>)

3.22.3 / 2019-05-06
==================

**fixes**
  * [[`6174f9b`](http://github.com/eggjs/egg-mock/commit/6174f9b37698399785b99e86f2f45630f78a084f)] - fix: throw error when an egg plugin test is using bootstrap (#100) (TZ | 天猪 <<atian25@qq.com>>)

3.22.2 / 2019-04-10
==================

**fixes**
  * [[`a68ca65`](http://github.com/eggjs/egg-mock/commit/a68ca6549428e6c4dc886231d7c6b7fbefab46c6)] - fix: should emit server (#98) (TZ | 天猪 <<atian25@qq.com>>)

3.22.1 / 2019-03-12
==================

**fixes**
  * [[`3f73bad`](http://github.com/eggjs/egg-mock/commit/3f73bad59aa8acbb14399a914d31b8eb348ff493)] - fix: d.ts typo (#97) (TZ | 天猪 <<atian25@qq.com>>)

3.22.0 / 2019-03-11
==================

**features**
  * [[`81ed542`](http://github.com/eggjs/egg-mock/commit/81ed5427853067d84901c1848e630a8002ecfcf0)] - feat: add mock API for customLoader (#95) (Haoliang Gao <<sakura9515@gmail.com>>)

**fixes**
  * [[`58d0b32`](http://github.com/eggjs/egg-mock/commit/58d0b32a5851e4cd31492fe0e85c0e81336b6d04)] - fix:  remove nonexistent type and correct typing (#96) (Sinux <<askb@me.com>>)

3.21.0 / 2018-12-27
===================

  **features**
    * [[`93f8009`](https://github.com/eggjs/egg-mock/commit/93f8009c2f4c7d7f24b361f4713e035a2f993134)] - feat: cluster mock support result (#92) (TZ <<atian25@qq.com>>)
    * [[`be3d146`](https://github.com/eggjs/egg-mock/commit/be3d1466bf438a379b85429c40c510d6be7ecc26)] - feat: bootstrap support run on jest env (#93) (fengmk2 <<fengmk2@gmail.com>>)

3.20.1 / 2018-09-17
==================

**fixes**
  * [[`4b5dbb5`](http://github.com/eggjs/egg-mock/commit/4b5dbb512bf8f598d5ea5361c58ae9d40d528ff8)] - fix: add app.mockLog() to improve app.expectLog() more stable (#87) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`a64db33`](http://github.com/eggjs/egg-mock/commit/a64db33d2ee68a76f7c41303e79e37099f33b373)] - deps: add egg-logger dependency (#88) (fengmk2 <<fengmk2@gmail.com>>)

3.20.0 / 2018-08-30
==================

**features**
  * [[`283eef3`](http://github.com/eggjs/egg-mock/commit/283eef3a4f1b0bcd90cc0d6bcf6de9fe136d8503)] - feat: add `app.agent.mockHttpclient()` for agent (#82) (limerick <<guods2015@gmail.com>>)

3.19.7 / 2018-08-28
==================

**fixes**
  * [[`cc6b976`](http://github.com/eggjs/egg-mock/commit/cc6b976a66103dca44428e9ca4cf6e8d18b8323b)] - fix: app.messenger.broadcast send to self (君羽 <<ImHype@users.noreply.github.com>>)

3.19.6 / 2018-08-24
==================

**fixes**
  * [[`00fb82e`](http://github.com/eggjs/egg-mock/commit/00fb82eac8114f0be1a97421ea270947ea7b5efd)] - fix: fix declaration merging error (#86) (吖猩 <<whxaxes@qq.com>>)

3.19.5 / 2018-08-24
==================

**fixes**
  * [[`1635a90`](http://github.com/eggjs/egg-mock/commit/1635a9098d16df4ba4195d2e289476471bf96cb2)] - fix: show expectLog last 500 words on assert error (#85) (fengmk2 <<fengmk2@gmail.com>>)

3.19.4 / 2018-08-24
===================

  * feat: .d.ts 新增继承自 mm 的 api (#81)

3.19.3 / 2018-08-16
==================

**fixes**
  * [[`c91bf93`](http://github.com/eggjs/egg-mock/commit/c91bf93e792c788c4cdd7cf786a45fc2ecb4511d)] - fix: allow egg-core module missing (#83) (fengmk2 <<fengmk2@gmail.com>>)

3.19.2 / 2018-08-07
==================

**fixes**
  * [[`1710f7f`](http://github.com/eggjs/egg-mock/commit/1710f7fcfdbd8709d6b4c50817ab0c214c525378)] - fix: put mock restore at the end (#80) (fengmk2 <<fengmk2@gmail.com>>)

3.19.1 / 2018-08-07
==================

**fixes**
  * [[`db3cb11`](http://github.com/eggjs/egg-mock/commit/db3cb11a97ec6bdb3a70222a459241ffc3cc2c47)] - fix: make sure backgroundTasksFinished() return promise (#79) (fengmk2 <<fengmk2@gmail.com>>)

3.19.0 / 2018-08-06
==================

**features**
  * [[`ab5a47e`](https://github.com/eggjs/egg-mock.git/commit/ab5a47e12f1fea4300a44ef19aa4ba300574d18a)] - feat: should wait for background task finish on afterEach (#78) (fengmk2 <<fengmk2@gmail.com>>)

3.18.0 / 2018-08-03
==================

**features**
  * [[`f25c50a`](http://github.com/eggjs/egg-mock/commit/f25c50a24433e251e5c9f905170cea87e3ac93e6)] - feat: add `app.expectLog()` for app and cluster (#77) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`ffb1187`](http://github.com/eggjs/egg-mock/commit/ffb1187aab11bc544c4bc6c5921ca0fba28e621f)] - chore: improve tsd and add bootstrap.d.ts (#76) (SuperEVO <<zhang740@qq.com>>)

3.17.3 / 2018-07-14
===================

  * types: add bootstrap.d.ts (#75)

3.17.2 / 2018-05-21
==================

**others**
  * [[`62c3dfa`](http://github.com/eggjs/egg-mock/commit/62c3dfa517b94c56c35fed8af8d9aad29e7c38d4)] - refactor: middleware use promise-based style (#74) (Haoliang Gao <<sakura9515@gmail.com>>)

3.17.1 / 2018-04-21
===================

  * fix: remove options.typescript support (#73)

3.17.0 / 2018-03-30
===================

  * feat: support ts from env and pkg (#71)

3.16.0 / 2018-03-28
===================

  * feat: support ts (#70)
  * fix: mockSession save should not be enumerable (#69)

3.15.1 / 2018-03-20
==================

**fixes**
  * [[`3fbf862`](http://github.com/eggjs/egg-mock/commit/3fbf86232ee3c8e4944c8072e127c0f1ede1d26b)] - fix: mockSession save (#68) (TZ | 天猪 <<atian25@qq.com>>)

3.15.0 / 2018-03-08
==================

**features**
  * [[`9857065`](http://github.com/eggjs/egg-mock/commit/985706518e9ab8be155f285490484e5a304833fc)] - feat: add unexpectHeader() and expectHeader() (#67) (fengmk2 <<fengmk2@gmail.com>>)
  * [[`f1820d7`](http://github.com/eggjs/egg-mock/commit/f1820d70f2e266d4b18fb7062976b4c14952a16f)] - feat: mm.app() support server event (#65) (fengmk2 <<fengmk2@gmail.com>>)

3.14.1 / 2018-02-28
==================

**fixes**
  * [[`d38d615`](http://github.com/eggjs/egg-mock/commit/d38d615c3f9bc79eb09c6864ab9d5833a50d029a)] - fix: mockUrl accepts RegExp (#64) (Brick <<brick.c.yang@gmail.com>>)

**others**
  * [[`23c1075`](http://github.com/eggjs/egg-mock/commit/23c1075f5aaaa866b0243061d0eadf21ce67d382)] - test: add post with multipart file test cases (#63) (fengmk2 <<fengmk2@gmail.com>>)

3.14.0 / 2017-12-12
==================

**others**
  * [[`be9bcd2`](http://github.com/eggjs/egg-mock/commit/be9bcd22c91044b0efdbc3db6b8109cf625002b1)] - refactor: modify d.ts and support bootstrap (Eward Song <<eward.song@gmail.com>>)

3.13.1 / 2017-10-17
==================

**fixes**
  * [[`9d071b2`](http://github.com/eggjs/egg-mock/commit/9d071b28c5ef341ee63ccb06f00f724922c698b2)] - fix: support mock the same property multiple times (#61) (Yiyu He <<dead_horse@qq.com>>)

3.13.0 / 2017-10-10
==================

**features**
  * [[`30ca0c9`](http://github.com/eggjs/egg-mock/commit/30ca0c980f3ee8b1f60f5213f0768fe5eeaaf49a)] - feat: port can be customized (#60) (Haoliang Gao <<sakura9515@gmail.com>>)

3.12.2 / 2017-09-22
==================

**fixes**
  * [[`5935564`](http://github.com/eggjs/egg-mock/commit/5935564d1e649f8702c0f3f79e67efde10717542)] - fix: missing methods package (dainli <<dainli@outlook.com>>)

**others**
  * [[`e7f518a`](http://github.com/eggjs/egg-mock/commit/e7f518a92e1686973bea557eb0a21f1d293ab0b4)] - fix(mockHttpclient): should use the copy of mockResult (#58) (Haoliang Gao <<sakura9515@gmail.com>>)
 * [new tag]         3.12.1     -> 3.12.1


3.12.1 / 2017-09-13
==================

**others**
  * [[`e7f518a`](http://github.com/eggjs/egg-mock/commit/e7f518a92e1686973bea557eb0a21f1d293ab0b4)] - fix(mockHttpclient): should use the copy of mockResult (#58) (Haoliang Gao <<sakura9515@gmail.com>>)

3.12.0 / 2017-09-12
==================

**others**
  * [[`25a0e28`](http://github.com/eggjs/egg-mock/commit/25a0e28e85209ec08a593b38cd434ed389ef8887)] - feat(mockHttpclient): use Regular Expression for matching url (#57) (Haoliang Gao <<sakura9515@gmail.com>>)

3.11.0 / 2017-09-11
==================

**features**
  * [[`f1a08a6`](http://github.com/eggjs/egg-mock/commit/f1a08a654a08313c0848828ee9051f8bf174fc6a)] - feat: support httpRequest().get(routerName) (#56) (fengmk2 <<fengmk2@gmail.com>>)

3.10.0 / 2017-08-30
==================

**features**
  * [[`f3654df`](http://github.com/eggjs/egg-mock/commit/f3654df99d4bee2ea0ee1ef580af7af66f21255d)] - feat: base promise to support async function (#55) (Yiyu He <<dead_horse@qq.com>>)

3.9.1 / 2017-08-14
==================

**fixes**
  * [[`d6cafaa`](http://github.com/eggjs/egg-mock/commit/d6cafaa531d9bbcc0fc987e7d6fdefd6a515e785)] - fix: fix agent type after ready (#54) (zōng yǔ <<gxcsoccer@users.noreply.github.com>>)

3.9.0 / 2017-08-02
==================

**features**
  * [[`9e1642c`](http://github.com/eggjs/egg-mock/commit/9e1642c7fc569d3cc4a73c9ede6511a18cca6fc5)] - feat: add bootstrap (#53) (Yiyu He <<dead-horse@users.noreply.github.com>>)

3.8.0 / 2017-06-21
==================

  * deps: upgrade dependencies (#51)
  * test: disable coverage when mm.cluster (#50)

3.7.2 / 2017-06-07
==================

  * fix(httpclient): miss headers on options when emit response (#49)

3.7.1 / 2017-06-01
==================

  * fix: detect prop object type can be non string (#48)

3.7.0 / 2017-05-18
===================

  * feat: support prerequire files (#46)

3.6.1 / 2017-05-11
==================

  * fix: ignore all error on cluster mock restore (#45)

3.6.0 / 2017-05-10
==================

  * chore: add tsd (#43)
  * feat: support mock function on cluster mode (#44)
  * deps: upgrade dependencies (#42)

3.5.0 / 2017-04-25
==================

  * feat: mockUrllib support async function (#41)

3.4.0 / 2017-04-17
==================

  * feat: should pass when emit egg-ready (#39)

3.3.0 / 2017-04-15
==================

  * feat: add app.httpRequest() test helper (#38)

3.2.0 / 2017-03-14
==================

  * feat: mockHttpClient support mock multi methods (#35)
  * test: remove userrole (#34)

3.1.2 / 2017-03-05
==================

  * fix: should pass all arguments when mockCookies (#33)

3.1.1 / 2017-03-04
==================

  * fix: egg-mock is not a framework (#32)

3.1.0 / 2017-03-02
==================

  * feat: use framework instead of customEgg (#31)

3.0.1 / 2017-02-22
==================

  * fix: app.close in right order (#30)

3.0.0 / 2017-02-13
==================

  * deps: upgrade egg (#29)
  * fix: bind messenger with app and agent (#28)
  * feat: [BREAKING_CHANGE] can get error from .ready() (#27)
  * test: remove unuse codes (#26)

2.4.0 / 2017-02-08
==================

  * feat: listen error that thrown when app init (#25)

2.3.1 / 2017-01-26
==================

  * fix: improve proxy handler and event listener (#24)

2.3.0 / 2017-01-25
==================

  * feat: cluster-client support for mm.app (#23)

2.2.0 / 2017-01-25
==================

  * feat: reimplement mm.app (#22)

2.1.0 / 2017-01-16
==================

  * feat: support read framework from package.json (#20)

2.0.0 / 2017-01-12
==================

  * refactor: use mockHttpclient instead of mockUrllib (#19)

1.3.0 (deprecated) / 2017-01-12
==================

  * refactor: use mockHttpclient instead of mockUrllib (#19)

1.2.1 / 2017-01-09
==================

  * fix: can't override data when mockContext(data) (#18)
  * fix: replace the internal link into an github link in the env comment. (#17)

1.2.0 / 2016-11-11
==================

  * feat: try to lookup egg that will be the default customEgg (#16)
  * fix: don't use cache when app from cache is closed (#15)

1.1.0 / 2016-11-02
==================

  * feat: add mm.home (#14)

1.0.0 / 2016-11-01
==================

  * test: add testcase (#10)

0.0.8 / 2016-10-25
==================

  * feat: wait 10ms to close app (#13)

0.0.7 / 2016-10-25
==================

  * feat: should close agent when app close (#12)

0.0.6 / 2016-10-24
==================

  * feat: cluster should wait process exit (#11)
  * docs:update readme (#9)
  * docs: update readme

0.0.5 / 2016-10-11
==================

  * feat: pass opt to coffee (#7)

0.0.4 / 2016-08-16
==================

  * fix: add eggPath for new egg (#5)
