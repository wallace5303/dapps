
5.4.0 / 2020-04-28
==================

**features**
  * [[`62c2d11`](http://github.com/node-modules/coffee/commit/62c2d1104af9944ae1c05ca1b4280c3f21ff222e)] - feat: pass instance to event (#81) (TZ | 天猪 <<atian25@qq.com>>)

5.3.0 / 2020-04-22
==================

**features**
  * [[`462c583`](http://github.com/node-modules/coffee/commit/462c5837246a9b4d0fd757f4982f1c3cafb95ce4)] - feat: support on event (#80) (TZ | 天猪 <<atian25@qq.com>>)

5.2.2 / 2019-07-30
==================

**fixes**
  * [[`afc4372`](http://github.com/node-modules/coffee/commit/afc4372f250f75124e7dc403d8a1cf7eca19e68b)] - fix: should kill child when coffee exit (#78) (TZ | 天猪 <<atian25@qq.com>>)

**others**
  * [[`1a6b20f`](http://github.com/node-modules/coffee/commit/1a6b20fa222430109fb2bcfdd650f3831a8b6559)] - docs: update license (#75) (维特 <<nanazuimeng123@gmail.com>>)

5.2.1 / 2018-12-27
==================

  * fix: check cwd exists (#74)
  * fix: always end stdin (#73)
  * docs: add rule (#72)

5.2.0 / 2018-12-21
==================

  * feat: pass additional args to rule && improve docs && d.ts (#70)
  * feat: support writeKey (#71)

5.1.1 / 2018-12-17
==================

**fixes**
  * [[`6b4f81c`](http://github.com/node-modules/coffee/commit/6b4f81c40f34fb3ed3bc76496368cf9088a230fc)] - fix: beforeScript should not change process.execArgv (#69) (DiamondYuan <<541832074@qq.com>>)

5.1.0 / 2018-08-08
==================

**features**
  * [[`44ded02`](http://github.com/node-modules/coffee/commit/44ded027e022a000db1e908f764c4dc3288b0f4a)] - feat: print should take a goooood look (#63) (TZ | 天猪 <<atian25@qq.com>>)

5.0.1 / 2018-08-07
==================

5.0.0 / 2018-08-07
==================

**others**
  * [[`f7309da`](http://github.com/node-modules/coffee/commit/f7309da0eeb1e400f704024daaab456756890820)] - refactor: [BREAKING] make coffee more extendable (#62) (TZ | 天猪 <<atian25@qq.com>>)
  * [[`728418b`](http://github.com/node-modules/coffee/commit/728418b91799ed8c4b6865ca78951ef7288829e6)] - chore: migrate to node-modules (#61) (Haoliang Gao <<sakura9515@gmail.com>>)

4.2.0 / 2018-08-01
==================

**features**
  * [[`b0e16e0`](http://github.com/node-modules/coffee/commit/b0e16e00aa903b53950e28606959719df68539cc)] - feat: support prompt (#60) (TZ | 天猪 <<atian25@qq.com>>)

4.1.0 / 2017-06-29
==================

  * feat: support fork process before hook script (#59)

4.0.1 / 2017-06-19
==================

  * fix: using cross-spawn instead of spawn on Windows (#58)

4.0.0 / 2017-06-16
==================

  * feat: [BREAKING_CHANGE] use nyc instead of istanbul (#57)

3.3.2 / 2017-05-22
==================

  * deps: upgrade dependencies (#56)
  * test: use assert instead of should (#54)

3.3.1 / 2017-05-10
==================

  * fix: should support fork(cmd, opt) (#52)

3.3.0 / 2016-10-14
==================

  * feat: support promise (#51)

3.2.5 / 2016-08-19
==================

  * fix: return istanbul_bin_path if exists (#50)

3.2.4 / 2016-07-08
==================

  * fix: generator coverage.json to $PWD/coverage (#49)

3.2.3 / 2016-07-08
==================

  * fix: always use the cwd of the main process

3.2.2 / 2016-06-15
==================

  * style: use eslint-config-egg
  * fix: catch resolve when process.env._ is not found

3.2.1 / 2016-02-26
==================

  * fix: assert the wrong type, less testcase :sweat:

3.2.0 / 2016-02-26
==================

  * feat: call .expect/notExpect after end

3.1.1 / 2016-02-24
==================

  * fix: disable debug

3.1.0 / 2016-02-24
==================

  * feat: debug from COFFEE_DEBUG
  * feat: add .notExpect method

3.0.3 / 2016-01-14
==================

  * fix: should init and restore coffee_inject_istanbul

3.0.2 / 2016-01-09
==================

  * fix: process.env._ may not exist in webstorm

3.0.1 / 2016-01-07
==================

  * fix: should inject coverage when start with istanbul

3.0.0 / 2016-01-05
==================

  * feat: ignore coverage or not by .coverage()
  * feat: spawn without .end, use nextTick (break change)
  * feat: pass a number to .debug

2.1.0 / 2015-11-17
==================

  * feat: export this.proc

2.0.0 / 2015-10-31
==================

  * feat: easy to intergrate with instanbul
  * deps: upgrade childprocess to 2

1.3.1 / 2015-10-29
==================

  * fix: callback trigger twice when it throws

1.3.0 / 2015-10-29
==================

  * feat: pass stdout, stderr and code in end callback

1.2.0 / 2015-09-01
==================

  * feat: support options.autoCoverage to enable code coverage with istanbul
  * chore: eslint instead of jshint
  * test: coverage 100%
  * feat: add codecov.io
  * doc(readme): fixed example code

1.1.0 / 2015-05-23
==================

- feat: expect error
- chore: use pkg.files
- chore: use pkg.scripts
- feat: Write data to process.stdout and process.stderr for debug
- fix coveralls image

1.0.1 / 2015-05-15
==================

- fix: condition when use stdio: inherit

1.0.0
==================

First commit
