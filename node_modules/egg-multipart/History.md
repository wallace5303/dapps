
2.10.3 / 2020-05-06
==================

**fixes**
  * [[`718df0e`](http://github.com/eggjs/egg-multipart/commit/718df0e85455746e6126c6de8180b427e798d217)] - fix: incorrect file size limit (#44) (hyj1991 <<yeekwanvong@gmail.com>>)

2.10.2 / 2020-03-30
==================

**fixes**
  * [[`ce33219`](http://github.com/eggjs/egg-multipart/commit/ce33219f008e390a7321a8dfb52e887ca2d6aa71)] - fix: definition of config.whitelist (#43) (cjf <<cjfff1996@gmail.com>>)

**others**
  * [[`94c1135`](http://github.com/eggjs/egg-multipart/commit/94c1135f49dfbcea3a39d59b1b5e2b0a351d217a)] - docs: fix error handler example (#42) (zeroslope <<10218146+zeroslope@users.noreply.github.com>>)

2.10.1 / 2019-12-16
==================

**fixes**
  * [[`3451864`](http://github.com/eggjs/egg-multipart/commit/34518642562b8712040220090ee5828583a2fdcf)] - fix: support extname not speicified (#40) (刘涛 <<liutaofe@gmail.com>>)

2.10.0 / 2019-12-11
==================

**features**
  * [[`21ded55`](http://github.com/eggjs/egg-multipart/commit/21ded553420c383bf854a7e3374b0c5bb8c18581)] - feat: compatibility without dot at fileExtensions (#39) (TZ | 天猪 <<atian25@qq.com>>)

2.9.1 / 2019-11-07
==================

**fixes**
  * [[`27464f3`](http://github.com/eggjs/egg-multipart/commit/27464f3b954b31005f042084a95cbfbac5dcf9a4)] - fix: add more error message (#38) (TZ | 天猪 <<atian25@qq.com>>)

2.9.0 / 2019-08-09
==================

**features**
  * [[`a1fcdab`](http://github.com/eggjs/egg-multipart/commit/a1fcdab00ef1113845bbe41a4c0b40ce9356cc94)] - feat: fileModeMatch support glob with egg-path-matching (#36) (TZ | 天猪 <<atian25@qq.com>>)

2.8.0 / 2019-08-03
==================

**features**
  * [[`5d3ee0f`](http://github.com/eggjs/egg-multipart/commit/5d3ee0f1b82ba705f8bac0468cb19ab6f1dce8ab)] - feat: saveRequestFiles support options (#37) (仙森 <<dapixp@gmail.com>>)

2.7.1 / 2019-05-22
==================

**fixes**
  * [[`75b1d48`](http://github.com/eggjs/egg-multipart/commit/75b1d48079b3c6b1358bf75197af0c8164ac926a)] - fix: whitelist declaration(#35) (Stephen <<stephenseraph@gmail.com>>)

2.7.0 / 2019-05-20
==================

**features**
  * [[`0d26aa0`](http://github.com/eggjs/egg-multipart/commit/0d26aa0862279eac15cf72281a90ccf77731e3d6)] - feat: export saveRequestFiles to context (#34) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`c5ca3ea`](http://github.com/eggjs/egg-multipart/commit/c5ca3ea2a46708744bb884f67fafee9bc1606df1)] - chore: remove tmp files and don't block the request's response (#33) (fengmk2 <<fengmk2@gmail.com>>)

2.6.2 / 2019-05-19
==================

**fixes**
  * [[`72b03aa`](http://github.com/eggjs/egg-multipart/commit/72b03aae2ef18bef7f8d0a71c323f072c567f8d5)] - fix: keep same metas as file stream on file mode (#32) (fengmk2 <<fengmk2@gmail.com>>)

2.6.1 / 2019-05-16
==================

**others**
  * [[`c5c4308`](http://github.com/eggjs/egg-multipart/commit/c5c43080df4c203c23053398390cfee25dc60542)] - chore: add typings and jsdocs (#31) (TZ | 天猪 <<atian25@qq.com>>)

2.6.0 / 2019-05-16
==================

**features**
  * [[`7eb534f`](http://github.com/eggjs/egg-multipart/commit/7eb534f3b2cdb44fda025cf831877b8be7e84b55)] - feat: support file mode on default stream mode (#30) (fengmk2 <<fengmk2@gmail.com>>)

2.5.0 / 2019-05-01
==================

**features**
  * [[`33c6b52`](http://github.com/eggjs/egg-multipart/commit/33c6b52fcd7cc4674cc2ff51dfe849adf078ad5c)] - feat(types): typescript support (#28) (George <<main.lukai@gmail.com>>)

**others**
  * [[`6be344f`](http://github.com/eggjs/egg-multipart/commit/6be344fd7cdaa04c8e0861f5295244c8a85d14e8)] - test: fix schedule task test case (#29) (George <<main.lukai@gmail.com>>)

2.4.0 / 2018-12-26
==================

**features**
  * [[`d7504b9`](http://github.com/eggjs/egg-multipart/commit/d7504b9635c68184181c751212c30a6eb53f87fe)] - feat: custom multipart parse options per request (#27) (fengmk2 <<fengmk2@gmail.com>>)

2.3.0 / 2018-11-11
==================

**features**
  * [[`8d63cea`](http://github.com/eggjs/egg-multipart/commit/8d63cea48134d4d2a69796a399f04117222efd70)] - feat: export ctx.cleanupRequestFiles to improve cleanup more easy (#22) (fengmk2 <<fengmk2@gmail.com>>)

2.2.1 / 2018-09-29
==================

  * chore: fix egg docs build (#21)
  * chore: add azure pipelines badge

2.2.0 / 2018-09-29
==================

**features**
  * [[`75c0733`](http://github.com/eggjs/egg-multipart/commit/75c0733bcbb68349970b5d2bb189bf8822954337)] - feat: Provide `file` mode to handle multipart request (#19) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`0b4e118`](http://github.com/eggjs/egg-multipart/commit/0b4e118a8eef3e61262fb981999cc2173dc08cc3)] - chore: no need to consume stream on error throw (#18) (fengmk2 <<fengmk2@gmail.com>>)

2.1.0 / 2018-08-07
==================

**features**
  * [[`5ece18a`](http://github.com/eggjs/egg-multipart/commit/5ece18abd0a1026fa742e15a7480010619156051)] - feat: getFileStream() can accept non file request (#17) (fengmk2 <<fengmk2@gmail.com>>)

2.0.0 / 2017-11-10
==================

**others**
  * [[`6a7fa06`](http://github.com/eggjs/egg-multipart/commit/6a7fa06d8978d061950d339cdd685b1ace6995c3)] - refactor: use async function and support egg@2 (#15) (Yiyu He <<dead_horse@qq.com>>)

1.5.1 / 2017-10-27
==================

**fixes**
  * [[`a7778e5`](http://github.com/eggjs/egg-multipart/commit/a7778e58f603c5efe298c8a651356d203afefed0)] - fix: fileSize typo (#10) (tangyao <<2001-wms@163.com>>)

**others**
  * [[`f95e322`](http://github.com/eggjs/egg-multipart/commit/f95e32287570f8f79de3061abfdfcbc93823f44f)] - docs: add more example (#14) (Haoliang Gao <<sakura9515@gmail.com>>)
  * [[`b0785e3`](http://github.com/eggjs/egg-multipart/commit/b0785e34bb68b18af0d9f50bc3bf40cb91987391)] - docs: s/extention/extension (#13) (Sen Yang <<jasonslyvia@users.noreply.github.com>>)
  * [[`d67fcf5`](http://github.com/eggjs/egg-multipart/commit/d67fcf5b64d0252345e04325c170e14786bc55a4)] - test: improve code coverage (#12) (fengmk2 <<fengmk2@gmail.com>>)
  * [[`c8b77df`](http://github.com/eggjs/egg-multipart/commit/c8b77dfa9ad44dace89ef62531f182a4960843f6)] - test: fix failing test (#11) (Haoliang Gao <<sakura9515@gmail.com>>)

1.5.0 / 2017-06-09
==================

  * refactor: always log when exceed limt (#9)

1.4.0 / 2017-05-18
==================

  * feat: Add upper case extname support (#7)

1.3.0 / 2017-04-21
==================

  * feat: whitelist support fn && english readme (#6)

1.2.0 / 2017-03-18
==================

  * feat: should emit stream error event when file too large (#5)
  * deps: upgrade all dev deps (#4)

1.1.0 / 2017-02-08
==================

  * feat: getFileStream return promise (#3)

1.0.0 / 2016-08-02
==================

 * init version
