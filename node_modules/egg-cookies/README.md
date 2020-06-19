# egg-cookies

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-cookies.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-cookies
[travis-image]: https://img.shields.io/travis/eggjs/egg-cookies.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-cookies
[codecov-image]: https://codecov.io/gh/eggjs/egg-cookies/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/eggjs/egg-cookies
[david-image]: https://img.shields.io/david/eggjs/egg-cookies.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-cookies
[snyk-image]: https://snyk.io/test/npm/egg-cookies/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-cookies
[download-image]: https://img.shields.io/npm/dm/egg-cookies.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-cookies

Extends [pillarjs/cookies](https://github.com/pillarjs/cookies) to adapt koa and egg with some additional features.

## Encrypt

egg-cookies provide an alternative `encrypt` mode like `signed`. An encrypt cookie's value will be encrypted base on keys. Anyone who don't have the keys are unable to know the original cookie's value.

```js
const Cookies = require('egg-cookies');
const cookies = new Cookies(ctx, keys[, defaultCookieOptions]);

cookies.set('foo', 'bar', { encrypt: true });
cookies.get('foo', { encrypt: true });
```

**Note: you should both indicating in get and set in pairs.**

## Cookie Length Check

[Browsers all had some limitation in cookie's length](http://browsercookielimits.squawky.net/), so if set a cookie with an extremely long value(> 4093), egg-cookies will emit an `cookieLimitExceed` event. You can listen to this event and record.

```js
const Cookies = require('egg-cookies');
const cookies = new Cookies(ctx, keys);

cookies.on('cookieLimitExceed', { name, value } => {
  // log
});

cookies.set('foo', longText);
```

## License

[MIT](LICENSE.txt)
