'use strict';

const assert = require('assert');
const is = require('is-type-of');
const FileLoader = require('./file_loader');
const CLASSLOADER = Symbol('classLoader');
const EXPORTS = FileLoader.EXPORTS;

class ClassLoader {

  constructor(options) {
    assert(options.ctx, 'options.ctx is required');
    const properties = options.properties;
    this._cache = new Map();
    this._ctx = options.ctx;

    for (const property in properties) {
      this.defineProperty(property, properties[property]);
    }
  }

  defineProperty(property, values) {
    Object.defineProperty(this, property, {
      get() {
        let instance = this._cache.get(property);
        if (!instance) {
          instance = getInstance(values, this._ctx);
          this._cache.set(property, instance);
        }
        return instance;
      },
    });
  }
}

/**
 * Same as {@link FileLoader}, but it will attach file to `inject[fieldClass]`. The exports will be lazy loaded, such as `ctx.group.repository`.
 * @extends FileLoader
 * @since 1.0.0
 */
class ContextLoader extends FileLoader {

  /**
   * @class
   * @param {Object} options - options same as {@link FileLoader}
   * @param {String} options.fieldClass - determine the field name of inject object.
   */
  constructor(options) {
    assert(options.property, 'options.property is required');
    assert(options.inject, 'options.inject is required');
    const target = options.target = {};
    if (options.fieldClass) {
      options.inject[options.fieldClass] = target;
    }
    super(options);

    const app = this.options.inject;
    const property = options.property;

    // define ctx.service
    Object.defineProperty(app.context, property, {
      get() {
        // distinguish property cache,
        // cache's lifecycle is the same with this context instance
        // e.x. ctx.service1 and ctx.service2 have different cache
        if (!this[CLASSLOADER]) {
          this[CLASSLOADER] = new Map();
        }
        const classLoader = this[CLASSLOADER];

        let instance = classLoader.get(property);
        if (!instance) {
          instance = getInstance(target, this);
          classLoader.set(property, instance);
        }
        return instance;
      },
    });
  }
}

module.exports = ContextLoader;


function getInstance(values, ctx) {
  // it's a directory when it has no exports
  // then use ClassLoader
  const Class = values[EXPORTS] ? values : null;
  let instance;
  if (Class) {
    if (is.class(Class)) {
      instance = new Class(ctx);
    } else {
      // it's just an object
      instance = Class;
    }
  // Can't set property to primitive, so check again
  // e.x. module.exports = 1;
  } else if (is.primitive(values)) {
    instance = values;
  } else {
    instance = new ClassLoader({ ctx, properties: values });
  }
  return instance;
}
