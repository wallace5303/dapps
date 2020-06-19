'use strict';

const locales = require('koa-locales');
const fs = require('fs');
const path = require('path');
const debug = require('debug')('egg:plugin:i18n');

/**
 * I18n 国际化
 *
 * 通过设置 Plugin 配置 `i18n: true`，开启多语言支持。
 *
 * #### 语言文件存储路径
 *
 * 统一存放在 `config/locale/*.js` 下（ 兼容`config/locales/*.js` ），如包含英文，简体中文，繁体中文的语言文件：
 *
 * ```
 * - config/locale/
 *   - en-US.js
 *   - zh-CN.js
 *   - zh-TW.js
 * ```
 * @class I18n
 * @param {App} app Application object.
 * @example
 *
 * #### I18n 文件内容
 *
 * ```js
 * // config/locale/zh-CN.js
 * module.exports = {
 *   "Email": "邮箱",
 *   "Welcome back, %s!": "欢迎回来, %s!",
 *   "Hello %s, how are you today?": "你好 %s, 今天过得咋样？",
 * };
 * ```
 *
 * ```js
 * // config/locale/en-US.js
 * module.exports = {
 *   "Email": "Email",
 * };
 * ```
 * 或者也可以用 JSON 格式的文件:
 *
 * ```js
 * // config/locale/zh-CN.json
 * {
 *   "email": "邮箱",
 *   "login": "帐号",
 *   "createdAt": "注册时间"
 * }
 * ```
 */
module.exports = app => {
  /**
   * 如果开启了 I18n 多语言功能，那么会出现此 API，通过它可以获取到当前请求对应的本地化数据。
   *
   * 详细使用说明，请查看 {@link I18n}
   * - `ctx.__ = function (key, value[, value2, ...])`: 类似 `util.format` 接口
   * - `ctx.__ = function (key, values)`: 支持数组下标占位符方式，如
   * - `__` 的别名是 `gettext(key, value)`
   *
   * > NOTE: __ 是两个下划线哦！
   * @method Context#__
   * @example
   * ```js
   * ctx.__('{0} {0} {1} {1}'), ['foo', 'bar'])
   * ctx.gettext('{0} {0} {1} {1}'), ['foo', 'bar'])
   * =>
   * foo foo bar bar
   * ```
   * ##### Controller 下的使用示例
   *
   * ```js
   * module.exports = function* () {
   *   this.body = {
   *     message: this.__('Welcome back, %s!', this.user.name),
   *     // 或者使用 gettext，如果觉得 __ 不好看的话
   *     // message: this.gettext('Welcome back, %s!', this.user.name),
   *     user: this.user,
   *   };
   * };
   * ```
   *
   * ##### View 文件下的使用示例
   *
   * ```html
   * <li>{{ __('Email') }}: {{ user.email }}</li>
   * <li>
   *   {{ __('Hello %s, how are you today?', user.name) }}
   * </li>
   * <li>
   *   {{ __('{0} {0} {1} {1}'), ['foo', 'bar']) }}
   * </li>
   * ```
   *
   * ##### locale 参数获取途径
   *
   * 优先级从上到下：
   *
   * - query: `/?locale=en-US`
   * - cookie: `locale=zh-TW`
   * - header: `Accept-Language: zh-CN,zh;q=0.5`
   */
  app.config.i18n.functionName = '__';

  /* istanbul ignore next */
  app.config.i18n.dirs = Array.isArray(app.config.i18n.dirs) ? app.config.i18n.dirs : [];
  // 按 egg > 插件 > 框架 > 应用的顺序遍历 config/locale(config/locales) 目录，加载所有配置文件
  for (const unit of app.loader.getLoadUnits()) {
    const localePath = path.join(unit.path, 'config/locale');

    /**
     * 优先选择 `config/locale` 目录下的多语言文件
     * 避免 2 个目录同时存在时可能导致的冲突
     */
    if (fs.existsSync(localePath)) {
      app.config.i18n.dirs.push(localePath);
    } else {
      app.config.i18n.dirs.push(path.join(unit.path, 'config/locales'));
    }
  }

  debug('app.config.i18n.dirs:', app.config.i18n.dirs);

  locales(app, app.config.i18n);

  /**
   * `ctx.__` 的别名。
   * @see {@link Context#__}
   * @method Context#gettext
   */
  app.context.gettext = app.context.__;

  // 自动加载 Middleware
  app.config.coreMiddleware.push('i18n');
};
