'use strict';

module.exports = () => {

  const exports = {};

  /**
   * I18n options
   * @member Config#i18n
   * @property {String} defaultLocale - 默认语言是美式英语，毕竟支持多语言，基本都是以英语为母板
   * @property {Array} dirs - 多语言资源文件存放路径，不建议修改
   * @property {String} queryField - 设置当前语言的 query 参数字段名，默认通过 `query.locale` 获取
   *   如果你想修改为 `query.lang`，那么请通过修改此配置实现
   * @property {String} cookieField - 如果当前请求用户语言有变化，都会设置到 cookie 中保持着，
   *   默认是存储在key 为 locale 的 cookie 中
   * @property {String} cookieDomain - 存储 locale 的 cookie domain 配置，默认不设置，为当前域名才有效
   * @property {String|Number} cookieMaxAge - cookie 默认 `1y` 一年后过期，
   *   如果设置为 Number，则单位为 ms
   */
  exports.i18n = {
    defaultLocale: 'en_US',
    dirs: [],
    queryField: 'locale',
    cookieField: 'locale',
    cookieDomain: '',
    cookieMaxAge: '1y',
  };

  return exports;
};
