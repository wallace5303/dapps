'use strict';

const Debug = require('debug');
const debug = Debug('koa-locales');
const debugSilly = Debug('koa-locales:silly');
const ini = require('ini');
const util = require('util');
const fs = require('fs');
const path = require('path');
const ms = require('humanize-ms');
const assign = require('object-assign');

const DEFAULT_OPTIONS = {
  defaultLocale: 'en-US',
  queryField: 'locale',
  cookieField: 'locale',
  localeAlias: {},
  writeCookie: true,
  cookieMaxAge: '1y',
  dir: undefined,
  dirs: [ path.join(process.cwd(), 'locales') ],
  functionName: '__',
};

module.exports = function (app, options) {
  options = assign({}, DEFAULT_OPTIONS, options);
  const defaultLocale = formatLocale(options.defaultLocale);
  const queryField = options.queryField;
  const cookieField = options.cookieField;
  const cookieDomain = options.cookieDomain;
  const localeAlias = options.localeAlias;
  const writeCookie = options.writeCookie;
  const cookieMaxAge = ms(options.cookieMaxAge);
  const localeDir = options.dir;
  const localeDirs = options.dirs;
  const functionName = options.functionName;
  const resources = {};

  /**
   * @Deprecated Use options.dirs instead.
   */
  if (localeDir && localeDirs.indexOf(localeDir) === -1) {
    localeDirs.push(localeDir);
  }

  for (let i = 0; i < localeDirs.length; i++) {
    const dir = localeDirs[i];

    if (!fs.existsSync(dir)) {
      continue;
    }

    const names = fs.readdirSync(dir);
    for (let j = 0; j < names.length; j++) {
      const name = names[j];
      const filepath = path.join(dir, name);
      // support en_US.js => en-US.js
      const locale = formatLocale(name.split('.')[0]);
      let resource = {};

      if (name.endsWith('.js') || name.endsWith('.json')) {
        resource = flattening(require(filepath));
      } else if (name.endsWith('.properties')) {
        resource = ini.parse(fs.readFileSync(filepath, 'utf8'));
      }

      resources[locale] = resources[locale] || {};
      assign(resources[locale], resource);
    }
  }

  debug('Init locales with %j, got %j resources', options, Object.keys(resources));

  if (typeof app[functionName] !== 'undefined') {
    console.warn('[koa-locales] will override exists "%s" function on app', functionName);
  }

  function gettext(locale, key, value) {
    if (arguments.length === 0 || arguments.length === 1) {
      // __()
      // --('en')
      return '';
    }

    const resource = resources[locale] || {};

    let text = resource[key];
    if (text === undefined) {
      text = key;
    }

    debugSilly('%s: %j => %j', locale, key, text);
    if (!text) {
      return '';
    }

    if (arguments.length === 2) {
      // __(locale, key)
      return text;
    }
    if (arguments.length === 3) {
      if (isObject(value)) {
        // __(locale, key, object)
        // __('zh', '{a} {b} {b} {a}', {a: 'foo', b: 'bar'})
        // =>
        // foo bar bar foo
        return formatWithObject(text, value);
      }

      if (Array.isArray(value)) {
        // __(locale, key, array)
        // __('zh', '{0} {1} {1} {0}', ['foo', 'bar'])
        // =>
        // foo bar bar foo
        return formatWithArray(text, value);
      }

      // __(locale, key, value)
      return util.format(text, value);
    }

    // __(locale, key, value1, ...)
    const args = new Array(arguments.length - 1);
    args[0] = text;
    for(let i = 2; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
    return util.format.apply(util, args);
  }

  app[functionName] = gettext;

  app.context[functionName] = function (key, value) {
    if (arguments.length === 0) {
      // __()
      return '';
    }

    const locale = this.__getLocale();
    if (arguments.length === 1) {
      return gettext(locale, key);
    }
    if (arguments.length === 2) {
      return gettext(locale, key, value);
    }
    const args = new Array(arguments.length + 1);
    args[0] = locale;
    for(let i = 0; i < arguments.length; i++) {
      args[i + 1] = arguments[i];
    }
    return gettext.apply(this, args);
  };

  // 1. query: /?locale=en-US
  // 2. cookie: locale=zh-TW
  // 3. header: Accept-Language: zh-CN,zh;q=0.5
  app.context.__getLocale = function () {
    if (this.__locale) {
      return this.__locale;
    }

    const cookieLocale = this.cookies.get(cookieField, { signed: false });

    // 1. Query
    let locale = this.query[queryField];
    let localeOrigin = 'query';

    // 2. Cookie
    if (!locale) {
      locale = cookieLocale;
      localeOrigin = 'cookie';
    }

    // 3. Header
    if (!locale) {
      // Accept-Language: zh-CN,zh;q=0.5
      // Accept-Language: zh-CN
      let languages = this.acceptsLanguages();
      if (languages) {
        if (Array.isArray(languages)) {
          if (languages[0] === '*') {
            languages = languages.slice(1);
          }
          if (languages.length > 0) {
            for (let i = 0; i < languages.length; i++) {
              const lang = formatLocale(languages[i]);
              if (resources[lang] || localeAlias[lang]) {
                locale = lang;
                localeOrigin = 'header';
                break;
              }
            }
          }
        } else {
          locale = languages;
          localeOrigin = 'header';
        }
      }

      // all missing, set it to defaultLocale
      if (!locale) {
        locale = defaultLocale;
        localeOrigin = 'default';
      }
    }

    // cookie alias
    if (locale in localeAlias) {
      const originalLocale = locale;
      locale = localeAlias[locale];
      debugSilly('Used alias, received %s but using %s', originalLocale, locale);
    }

    locale = formatLocale(locale);

    // validate locale
    if (!resources[locale]) {
      debugSilly('Locale %s is not supported. Using default (%s)', locale, defaultLocale);
      locale = defaultLocale;
    }

    // if header not send, set the locale cookie
    if (writeCookie && cookieLocale !== locale && !this.headerSent) {
      updateCookie(this, locale);
    }
    debug('Locale: %s from %s', locale, localeOrigin);
    debugSilly('Locale: %s from %s', locale, localeOrigin);
    this.__locale = locale;
    this.__localeOrigin = localeOrigin;
    return locale;
  };

  app.context.__getLocaleOrigin = function () {
    if (this.__localeOrigin) return this.__localeOrigin;
    this.__getLocale();
    return this.__localeOrigin;
  };

  app.context.__setLocale = function (locale) {
    this.__locale = locale;
    this.__localeOrigin = 'set';
    updateCookie(this, locale);
  };

  function updateCookie(ctx, locale) {
    const cookieOptions = {
      // make sure brower javascript can read the cookie
      httpOnly: false,
      maxAge: cookieMaxAge,
      signed: false,
      domain: cookieDomain,
      overwrite: true,
    };
    ctx.cookies.set(cookieField, locale, cookieOptions);
    debugSilly('Saved cookie with locale %s', locale);
  }
};

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

const ARRAY_INDEX_RE = /\{(\d+)\}/g;
function formatWithArray(text, values) {
  return text.replace(ARRAY_INDEX_RE, function (orignal, matched) {
    const index = parseInt(matched);
    if (index < values.length) {
      return values[index];
    }
    // not match index, return orignal text
    return orignal;
  });
}

const Object_INDEX_RE = /\{(.+?)\}/g;
function formatWithObject(text, values) {
  return text.replace(Object_INDEX_RE, function (orignal, matched) {
    const value = values[matched];
    if (value) {
      return value;
    }
    // not match index, return orignal text
    return orignal;
  });
}

function formatLocale(locale) {
  // support zh_CN, en_US => zh-CN, en-US
  return locale.replace('_', '-').toLowerCase();
}

function flattening(data) {

  const result = {};

  function deepFlat (data, keys) {
    Object.keys(data).forEach(function(key) {
      const value = data[key];
      const k = keys ? keys + '.' + key : key;
      if (isObject(value)) {
        deepFlat(value, k);
      } else {
        result[k] = String(value);
      }
    });
  }

  deepFlat(data, '');

  return result;
}
