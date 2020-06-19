
2.3.3 / 2020-03-27
==================

**fixes**
  * [[`b3f86c0`](http://github.com/eggjs/egg-cookies/commit/b3f86c01b19b790f8c06aca143a094ed4fa575bd)] - fix(SameSite): don't send SameSite=None on non-secure context (#26) (Eric Zhang <<hixyeric@gmail.com>>)

2.3.2 / 2020-02-19
==================

**fixes**
  * [[`c6e1e74`](http://github.com/eggjs/egg-cookies/commit/c6e1e74e77c53f68e79f0ebd799c755db470badd)] - fix: don't send SameSite=None on Chromium/Chrome < 80.x (#25) (fengmk2 <<fengmk2@gmail.com>>)

2.3.1 / 2019-12-17
==================

**fixes**
  * [[`d4f443a`](http://github.com/eggjs/egg-cookies/commit/d4f443a5bf3bfd0ba7bc726b1e8b74a35ba265d6)] - fix: don't set samesite=none on incompatible clients (#23) (fengmk2 <<fengmk2@gmail.com>>)

2.3.0 / 2019-12-06
==================

**features**
  * [[`d5e3d21`](http://github.com/eggjs/egg-cookies/commit/d5e3d215b1c51f70d932dba391d7da228a302312)] - feat: support SameSite=None (#18) (ziyunfei <<446240525@qq.com>>)
  * [[`4dd74d2`](http://github.com/eggjs/egg-cookies/commit/4dd74d2078b5aea11f11b3b40605b702ca9ccd60)] - feat: allow set default cookie options on top level (#22) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`57a005f`](http://github.com/eggjs/egg-cookies/commit/57a005fd501dad5fdadc25ea94db5474fbd6ca8c)] - chore: add license decoration (#20) (刘放 <<brizer@users.noreply.github.com>>)

2.2.7 / 2019-04-28
==================

**fixes**
  * [[`64e93e9`](http://github.com/eggjs/egg-cookies/commit/64e93e919558ee96e29de5c49d7132595e96b9b5)] - fix: empty cookie value should ignore maxAge (#17) (fengmk2 <<fengmk2@gmail.com>>)

2.2.6 / 2018-09-07
==================

  * fix: should still support 4, 6 (#16)

2.2.5 / 2018-09-07
==================

  * chore(typings): Remove 'ctx' in EggCookie's declaration and add a missing unit test (#15)

2.2.4 / 2018-09-06
==================

  * fix: public files && deps (#14)

2.2.3 / 2018-09-06
==================

  * chore: adjust some dep && config (#13)
  * test: Add unit tests for ts (#12)
  * chore(typings):  Extract 'EggCookies' for TypeScript intellisense (#11)

2.2.2 / 2017-12-14
==================

**fixes**
  * [[`d199238`](http://github.com/eggjs/egg-cookies/commit/d1992389558c24f26fbd6b617054c535e2c51319)] - fix: don't modify options (#9) (Roc Gao <<ggjqzjgp103@qq.com>>)

**others**
  * [[`1037873`](http://github.com/eggjs/egg-cookies/commit/103787342f9b45bcc794ec2adeda5e809af3328b)] - chore: jsdoc typo (#6) (TZ | 天猪 <<atian25@qq.com>>)

2.2.1 / 2017-02-22
==================

  * fix: emit on ctx.app (#5)

2.2.0 / 2017-02-21
==================

  * feat: check cookie value's length (#4)
  * feat: support cookie.sameSite (#3)

2.1.0 / 2016-11-22
==================

  * feat: cache keygrip (#2)

2.0.0 / 2016-11-22
==================

  * refactor: rewrite keygrip and cookies for egg/koa (#1)
  * chore: add zh-CN readme

1.0.0 / 2016-07-15
==================

  * init version
