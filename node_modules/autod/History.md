
3.1.0 / 2019-03-28
==================

**features**
  * [[`82db2fd`](http://github.com/node-modules/autod/commit/82db2fd1e84130e76a436102733982e536876822)] - feat: pass modules to plugin (gliudong <<gliudong@users.noreply.github.com>>)

**fixes**
  * [[`0864e9a`](http://github.com/node-modules/autod/commit/0864e9a942a4180b888c7ece3f9492084f086bc6)] - fix: range must parse in local (#39) (Yiyu He <<dead_horse@qq.com>>)
  * [[`87614ad`](http://github.com/node-modules/autod/commit/87614ad507afcaaca6bc8ce989b6ac8ee4a2d7cb)] - fix: should ignore vscode config (#36) (TZ | 天猪 <<atian25@qq.com>>)

3.0.1 / 2017-11-13
==================

**fixes**
  * [[`fb286d6`](http://github.com/node-modules/autod/commit/fb286d6f59ec5d6107cbe28d56bca37a0e01ef99)] - fix: devDependencies in dependencies should pass autod check (#31) (Yiyu He <<dead_horse@qq.com>>)

**others**
  * [[`b470681`](http://github.com/node-modules/autod/commit/b470681215df58441e83bfe00c428e9bcc92bb53)] - chore: clean (dead-horse <<dead_horse@qq.com>>)

3.0.0 / 2017-11-11
==================

**fixes**
  * [[`eca5d8f`](http://github.com/node-modules/autod/commit/eca5d8fc70d8d704b36446c0cf29ecc28b2239fe)] - fix: don't compare if no import (dead-horse <<dead_horse@qq.com>>)

**others**
  * [[`b752ed2`](http://github.com/node-modules/autod/commit/b752ed27552356b719d638d32e0ef24739d990f9)] - deps: update dependencies (dead-horse <<dead_horse@qq.com>>)
  * [[`960f13a`](http://github.com/node-modules/autod/commit/960f13a5625cadc92ba5f557f51c50846418f360)] - refactor: rewrite core logic, speed up! (Yiyu He <<dead_horse@qq.com>>)

2.10.1 / 2017-10-12
==================

**fixes**
  * [[`16e401b`](http://github.com/node-modules/autod/commit/16e401b2e2ccafc9471cab3cfcc525d98d42fdc8)] - fix: dont write when check (dead-horse <<dead_horse@qq.com>>)

2.10.0 / 2017-10-12
==================

**features**
  * [[`e142b00`](http://github.com/node-modules/autod/commit/e142b00931a36b3c3a5c8a30b37dfa2f31a01725)] - feat: check don't output dependencies info (dead-horse <<dead_horse@qq.com>>)

**fixes**
  * [[`8f769c3`](http://github.com/node-modules/autod/commit/8f769c37526f5ca72c5f52262ffab9367519dac1)] - fix: use preset-env (dead-horse <<dead_horse@qq.com>>)

2.9.0 / 2017-07-31
==================

**features**
  * [[`c7c309d`](http://github.com/node-modules/autod/commit/c7c309da0729cb81ef77af4c429d7f7877f24952)] - feat: support autod --check (#28) (fengmk2 <<fengmk2@gmail.com>>)

2.8.0 / 2017-03-22
==================

  * feat: support require.resolve (#27)

2.7.1 / 2016-08-19
==================

  * fix: keep will keep module not exist

2.7.0 / 2016-08-03
==================

  * deps: use ^
  * chore(deps): upgrade babel-core (#22)

2.6.1 / 2016-06-04
==================

  * fix: fix test options

2.6.0 / 2016-04-28
==================

  * feat: add cov and coverage to default exclude dir
  * fix: exclude test roots

2.5.2 / 2016-04-19 
==================

  * fix: support all es2015 and stage0
  * fix: remove registry url slash (#21)

2.5.1 / 2016-04-09
==================

  * fix: require preset and plugin

2.5.0 / 2016-04-09
==================

  * feat: support jsx
  * fix: use https://registry.npmjs.org
  * feat: read env.npm_config_registry

2.4.2 / 2016-01-21
==================

  * fix: 修复 semver

2.4.1 / 2015-12-23
==================

  * fix: fix keep

2.4.0 / 2015-12-23
==================

  * feat: support .autod.conf.js

2.3.0 / 2015-12-12
==================

  * feat: support autod plugin

2.2.0 / 2015-12-08
==================

  * desp: update dependencies
  * feat: support diable transfrom

2.1.3 / 2015-09-17
==================

  * traceur instead of babel

2.1.2 / 2015-09-17
==================

  * hotfix require

2.1.1 / 2015-09-14
==================

  * rename

2.1.0 / 2015-09-14
==================

  * support es6 import
  * deps: upgrade semver@2.3.0

2.0.1 / 2015-02-16
==================

  * fix: fix exclude in test folder

2.0.0 / 2015-01-15
==================

  * feat: use crequire to parse the require tag, fixes #3

1.2.0 / 2015-01-13
==================

  * feat: support --devprefix
  * bump dependencies

1.1.4 / 2014-11-29
==================

  * fix indent.

1.1.3 / 2014-11-29
==================

  * better display for print dependency map

1.1.2 / 2014-11-20
==================

  * fix typo error

1.1.1 / 2014-10-20
==================

  * Merge pull request #14 from node-modules/fix-publish-config-registry
  * fix publishConfig.registry not work bug

1.1.0 / 2014-10-18
==================

  * support array test roots

1.0.0 / 2014-10-01
==================

  * support -s for semver, close #13
  * add -D options, close #12

0.3.2 / 2014-08-06
==================

  * fix get registry from package.json

0.3.1 / 2014-08-06
==================

  * fix publishConfig.registry

0.3.0 / 2014-08-06
==================

  * Merge pull request #11 from node-modules/default-registry
  * try to read default registry from publishConfig

0.2.5 / 2014-08-04
==================

  * fix stupid typo

0.2.4 / 2014-07-27
==================

  * remove process.exit(0), fix --map

0.2.3 / 2014-07-22
==================

  * support scope

0.2.2 / 2014-06-26
==================

  * update reg to support kissy/lib/xtemplate type
  * update examples
  * Merge branch 'master' of github.com:node-modules/autod
  * update readme
  * Merge pull request #9 from coderhaoxin/master
  * fix typo

0.2.1 / 2014-06-06
==================

  * support mz/fs type
  * update registry link in readme

0.2.0 / 2014-05-25
==================

  * add minimatch, fixed #8
  * update default registry

0.1.4 / 2014-04-20
==================

  * fix prefix, default registry to taobao registry
  * Merge pull request #7 from popomore/master
  * fix double prefix in devDependencies

0.1.3 / 2014-04-10
==================

  * Merge pull request #6 from node-modules/timeout
  * increase request timeout

0.1.2 / 2014-03-14
==================

  * Merge pull request #5 from fengmk2/gzip
  * update urllib to support gzip and add full user-agent
  * remove test folder

0.1.1 / 2014-03-02
==================

  * fix reg error

0.1.0 / 2014-01-25
==================

  * print all the info even not write package.json
  * add print removed modules

0.0.13 / 2014-01-22
==================

  * hotfix old is undefiend, fixed #2

0.0.12 / 2014-01-20
==================

  * add update info

0.0.11 / 2014-01-17
==================

  * add -k --keep options, to keep version not change in package.json

0.0.10 / 2014-01-16
==================

  * support -d --dep

0.0.9 / 2014-01-15
==================

  * fix  can not be detected

0.0.8 / 2013-12-26
==================

  * fix reg

0.0.7 / 2013-12-26
==================

  * add -v, fix error message

0.0.6 / 2013-12-25
==================

  * fix filter

0.0.5 / 2013-12-25
==================

  * add -m options to display denpendencies map
  * update readme

0.0.4 / 2013-12-25
==================

  * add ignore, add color
  * add file map and --prefix
  * add file map and --prefix
  * add nodeICO

0.0.3 / 2013-12-24
==================

  * do not parse error and unknow version

0.0.2 / 2013-12-23
==================

  * support extname not equal to .js, fix `bin/autop` not be parsed

0.0.1 / 2013-12-23
==================

  * add npmignore
  * add readme
  * sort output
  * complete write to package.json
  * complete write to package.json
  * fix parseDir return error
  * filter core modules
  * add bin
  * add bin
  * fix comment
  * complete auto parse dependencies
