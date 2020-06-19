
3.1.0 / 2017-12-01
==================

**features**
  * [[`e59388a`](http://github.com/node-modules/tcp-base/commit/e59388a564304803d0b85222bce1dc3e945f6fac)] - feat: support unix-domain-socket (#11) (fisher <<fishbar@users.noreply.github.com>>)

**others**
  * [[`f9c56ee`](http://github.com/node-modules/tcp-base/commit/f9c56ee64afb38b4062e5f1a247db45cbce4192c)] - chore: bump to 3.0.0 (xiaochen.gaoxc <<xiaochen.gaoxc@alibaba-inc.com>>),

3.0.0 / 2017-04-20
==================

  * fix: invoke oneway after socket closed (#7)
  * refactor: [BREAKING-CHANGE] not support reconnect

2.0.0 / 2017-02-17
==================

  * refactor: [BREAKING-CHANGE] upgrade sdk-base (#5)

1.1.0 / 2016-11-30
==================

  * feat: add heartbeat timeout server host
  * feat: add socket write status

1.0.2 / 2016-11-11
==================

  * fix: use heartbeat logic to handle that connection stuck in CLOSE_WAIT status (#3)

1.0.1 / 2016-10-20
==================

  * fix: callback exception should not crash tcp-base (#2)

1.0.0 / 2016-09-18
==================

  * feat: implement tcp-base
