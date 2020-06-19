# egg-i18n

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-i18n.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-i18n
[travis-image]: https://img.shields.io/travis/eggjs/egg-i18n.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-i18n
[codecov-image]: https://codecov.io/github/eggjs/egg-i18n/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-i18n?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-i18n.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-i18n
[snyk-image]: https://snyk.io/test/npm/egg-i18n/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-i18n
[download-image]: https://img.shields.io/npm/dm/egg-i18n.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-i18n

可以为你的应用提供多语言的特性

## 功能

- 支持多种语言独立配置，统一存放在 config/locale/\*.js 下（ 兼容 `config/locales/*.js` ）；
- 提供 Middleware 为 View 提供 `\_\_`, `gettext` 函数获取多语言文案；
- 基于 URL 参数 `locale` 修改语言显示，同时会记录到 Cookie，下次请求会用 Cookie 里面的语言方案。

## 配置

默认处于关闭状态，你需要在 `config/plugin.js` 开启它：

```js
// config/plugin.js
exports.i18n = {
  enable: true,
  package: 'egg-i18n',
};
```

你可以修改 `config/config.default.js` 来设定 i18n 的配置项：

```js
// config/config.default.js
exports.i18n = {
  // 默认语言，默认 "en_US"
  defaultLocale: 'zh-CN',
  // URL 参数，默认 "locale"
  queryField: 'locale',
  // Cookie 记录的 key, 默认："locale"
  cookieField: 'locale',
  // Cookie 的 domain 配置，默认为空，代表当前域名有效
  cookieDomain: '',
  // Cookie 默认 `1y` 一年后过期， 如果设置为 Number，则单位为 ms
  cookieMaxAge: '1y',
};
```

其实大部分时候，你只需要修改一下 `defaultLocale` 设定默认的语言。

## 编写你的 I18n 多语言文件

```js
// config/locale/zh-CN.js
module.exports = {
  "Email": "邮箱",
  "Welcome back, %s!": "欢迎回来，%s!",
  "Hello %s, how are you today?": "你好 %s, 今天过得咋样？",
};
```

```js
// config/locale/en-US.js
module.exports = {
  "Email": "Email",
};
```

或者也可以用 JSON 格式的文件：

```json
// config/locale/zh-CN.json
{
  "email": "邮箱",
  "login": "帐号",
  "createdAt": "注册时间"
}
```

## 使用 I18n 函数获取语言文本

I18n 为你提供 `__` (Alias: `gettext`) 函数，让你可以轻松获得 locale 文件夹下面的多语言文本。

> NOTE: __ 是两个下划线哦！

- ctx.__ = function (key, value[, value2, ...]): 类似 util.format 接口
- ctx.__ = function (key, values): 支持数组下标占位符方式，如

```js
ctx.__('{0} {0} {1} {1}'), ['foo', 'bar'])
ctx.gettext('{0} {0} {1} {1}'), ['foo', 'bar'])
=>
foo foo bar bar
```

### Controllers 下的使用示例

```js
module.exports = function* () {
  this.body = {
    message: this.__('Welcome back, %s!', this.user.name)
    // 或者使用 gettext，如果觉得 __ 不好看的话
    // message: this.gettext('Welcome back, %s!', this.user.name)
    user: this.user,
  };
};
```

### View 文件下的使用示例

```html
<li>{{ __('Email') }}: {{ user.email }}</li>
<li>
  {{ __('Hello %s, how are you today?', user.name) }}
</li>
<li>
  {{ __('{0} {0} {1} {1}'), ['foo', 'bar']) }}
</li>
```

### 修改应用的默认语言

你可以用下面几种方式修改应用的当前语言（修改或会记录到 Cookie)，下次请求直接用设定好的语言。

优先级从上到下：

- query: /?locale=en-US
- cookie: locale=zh-TW
- header: Accept-Language: zh-CN,zh;q=0.5
