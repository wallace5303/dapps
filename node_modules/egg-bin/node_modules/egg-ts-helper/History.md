
1.25.8 / 2020-04-30
==================

**fixes**
  * [[`f633470`](http://github.com/whxaxes/egg-ts-helper/commit/f6334701fb91e9c9e03ec22f8e5af7b948f2be1a)] - fix: autoRemoveJs should works in register (#62) (吖猩 <<whxaxes@gmail.com>>)

**others**
  * [[`8f2c7a7`](http://github.com/whxaxes/egg-ts-helper/commit/8f2c7a7d518d0c5cca9a97573bc83ea91373bbb0)] - docs: update options (吖猩 <<whxaxes@gmail.com>>)

1.25.7 / 2020-03-05
==================

**features**
  * [[`cfed138`](http://github.com/whxaxes/egg-ts-helper/commit/cfed13880588650cc5bc9514cf775a12c080cb29)] - feat: support multi-level directory with intersection types (#53) (jinasonlin <<jinasonlin@gmail.com>>)

**fixes**
  * [[`29b6299`](http://github.com/whxaxes/egg-ts-helper/commit/29b6299118f814173d12c5e83569c08559ab3384)] - fix: service is method (#58) (吖猩 <<whxaxes@gmail.com>>)

1.25.6 / 2019-08-21
==================

**fixes**
  * [[`368e2a9`](http://github.com/whxaxes/egg-ts-helper/commit/368e2a99d303668ac540a56d47a489149d634a2c)] - fix: fix config types error (#51) (吖猩 <<whxaxes@gmail.com>>)
  * [[`a357f28`](http://github.com/whxaxes/egg-ts-helper/commit/a357f286d3c41c3d87211f8fb72897b5ee7330ec)] - fix: travis ci (wanghx <<whxaxes@gmail.com>>)

1.25.5 / 2019-06-23
==================

**fixes**
  * [[`8dcb9f2`](http://github.com/whxaxes/egg-ts-helper/commit/8dcb9f2da0814370f789a64d7f817b075971f8c7)] - fix: duplicate declaration (#50) (吖猩 <<whxaxes@gmail.com>>)

1.25.4 / 2019-06-10
==================

**features**
  * [[`8003dc2`](http://github.com/whxaxes/egg-ts-helper/commit/8003dc238ab845c291ee6c6a2e390f2669dbd8a0)] - feat: remove compatible for sequelize (#49) (吖猩 <<whxaxes@gmail.com>>)

1.25.3 / 2019-05-26
==================

**fixes**
  * [[`0cce02d`](http://github.com/whxaxes/egg-ts-helper/commit/0cce02dab86f05573fd50eccd703e4e23a7cb569)] - fix: same name dir and file (#48) (吖猩 <<whxaxes@gmail.com>>)

1.25.2 / 2019-03-26
==================

**fixes**
  * [[`928fad6`](http://github.com/whxaxes/egg-ts-helper/commit/928fad663cdf5da7352c7fd534dcd4d46d238d59)] - fix: downgrade ts-node (#46) (吖猩 <<whxaxes@qq.com>>)

1.25.1 / 2019-03-25
===================

  * [[`f36d699`](http://github.com/whxaxes/egg-ts-helper/commit/f36d69934403424f9715984dc9483c038b89725d)] - fix: check framework before deprecated (wanghx <<whxaxes@gmail.com>>)

1.25.0 / 2019-03-25
===================

  * [[`958b117`](http://github.com/whxaxes/egg-ts-helper/commit/958b1172c09a59eb0122bfa5e8afe9b296325faa)] - feat: config improvement (#45) (吖猩 <<whxaxes@qq.com>>)

1.24.2 / 2019-03-21
===================

  * fix: should clean file more intelligent (#44)

1.24.1 / 2019-03-11
===================

  * fix: clean files before startup & model compatible (#43)

1.24.0 / 2019-03-10
===================

  * feat: speed up booting (#42)
  * feat: add custom loader support (#41)
  * feat: load all plugins (#32)

1.23.0 / 2019-03-06
===================

  * feat: clean js file while it has the same name tsx file too (#40)
  * fix: spawn eagain (#38)

1.22.3 / 2019-02-24
===================

  * fix: register should use env instead of file (#37)

1.22.2 / 2019-02-23
===================

  * fix: no need to clean cache file (#36)

1.22.1 / 2019-02-18
===================

  * fix: ignore watcher initial (#33)
  * docs: update docs

1.22.0 / 2019-02-14
===================

  * feat: auto gen jsconfig in js project & pass options from env (#31)

1.21.0 / 2019-02-02
===================

  * feat: add Egg to global namespace (#30)

1.20.0 / 2019-01-06
===================

  * generator support default config
  * add silent to options of TsHelper
  * ext of config file default to .js or .json
  * add init command

1.19.2 / 2018-12-20
===================

  * fix: agent should merge to Agent (#26)

1.19.1 / 2018-12-12
===================

  * fix:  interfaceHandle cannot be covered (#25)

1.19.0 / 2018-12-12
===================

  * feat: generator of configure support file path
  * feat: add a new generator: auto
  * refactor: code splitting and add a new class Watcher

1.18.0 / 2018-12-10
===================

  * feat: interfaceHandle can be string
  * fix: interfaceHandle in `function` or `object` can be overwrite.

1.17.1 / 2018-12-05
===================

  * fix: fixed clean bug

1.17.0 / 2018-12-05
===================

  * feat: support js project & add oneForAll option (#21)

1.16.1 / 2018-11-29
===================

  * fix: add tslib deps

1.16.0 / 2018-11-29
===================

  * chore: update comment
  * feat: add prefix to interface
  * refactor: add esModuleInterop option
  * feat: add new generator `function` and `object`
  * refactor: refactor build-in generators

1.15.0 / 2018-11-28
===================

  * feat: add `declareTo` option
  * chore: upgrade typescript to 3.0

1.14.0 / 2018-11-12
===================

  * feat: caseStyle option add function support (#19)

1.13.0 / 2018-10-13
===================

  * feat: silent in test (#17)

1.12.1 / 2018-09-30
===================

  * fix: interface don't contain semicolon (#15)

1.12.0 / 2018-09-30
===================

  * feat: generate extend type with env (#14)

1.11.0 / 2018-09-10
===================

  * feat: Code Optimization (#10)

1.10.0 / 2018-08-30
===================

  * feat: model.enabled default to true
  * feat: add model check and only read framework from tsHelper.framework
  * docs: update docs

1.9.0 / 2018-06-22
==================

  * feat: add chokidar options

1.8.0 / 2018-05-29
==================

  * feat: support model

1.7.1 / 2018-05-22
==================

  * fix: fixed mistake of middleware dts

1.7.0 / 2018-05-07
==================

  * fix: lint fix
  * feat: support auto created d.ts for middleware

1.6.1 / 2018-04-23
==================

  * fix: make sure register was running only once time

1.6.0 / 2018-04-10
==================

  * feat: do not write file if ts not changed
  * feat: add plugin generator
