'use strict';

const debug = require('debug')('egg-core:extend');
const deprecate = require('depd')('egg');
const path = require('path');

const originalPrototypes = {
  request: require('koa/lib/request'),
  response: require('koa/lib/response'),
  context: require('koa/lib/context'),
  application: require('koa/lib/application'),
};

module.exports = {

  /**
   * mixin Agent.prototype
   * @function EggLoader#loadAgentExtend
   * @since 1.0.0
   */
  loadAgentExtend() {
    this.loadExtend('agent', this.app);
  },

  /**
   * mixin Application.prototype
   * @function EggLoader#loadApplicationExtend
   * @since 1.0.0
   */
  loadApplicationExtend() {
    this.loadExtend('application', this.app);
  },

  /**
   * mixin Request.prototype
   * @function EggLoader#loadRequestExtend
   * @since 1.0.0
   */
  loadRequestExtend() {
    this.loadExtend('request', this.app.request);
  },

  /**
   * mixin Response.prototype
   * @function EggLoader#loadResponseExtend
   * @since 1.0.0
   */
  loadResponseExtend() {
    this.loadExtend('response', this.app.response);
  },

  /**
   * mixin Context.prototype
   * @function EggLoader#loadContextExtend
   * @since 1.0.0
   */
  loadContextExtend() {
    this.loadExtend('context', this.app.context);
  },

  /**
   * mixin app.Helper.prototype
   * @function EggLoader#loadHelperExtend
   * @since 1.0.0
   */
  loadHelperExtend() {
    if (this.app && this.app.Helper) {
      this.loadExtend('helper', this.app.Helper.prototype);
    }
  },

  /**
   * Find all extend file paths by name
   * can be override in top level framework to support load `app/extends/{name}.js`
   *
   * @param {String} name - filename which may be `app/extend/{name}.js`
   * @return {Array} filepaths extend file paths
   * @private
   */
  getExtendFilePaths(name) {
    return this.getLoadUnits().map(unit => path.join(unit.path, 'app/extend', name));
  },

  /**
   * Loader app/extend/xx.js to `prototype`,
   * @function loadExtend
   * @param {String} name - filename which may be `app/extend/{name}.js`
   * @param {Object} proto - prototype that mixed
   * @since 1.0.0
   */
  loadExtend(name, proto) {
    this.timing.start(`Load extend/${name}.js`);
    // All extend files
    const filepaths = this.getExtendFilePaths(name);
    // if use mm.env and serverEnv is not unittest
    const isAddUnittest = 'EGG_MOCK_SERVER_ENV' in process.env && this.serverEnv !== 'unittest';
    for (let i = 0, l = filepaths.length; i < l; i++) {
      const filepath = filepaths[i];
      filepaths.push(filepath + `.${this.serverEnv}`);
      if (isAddUnittest) filepaths.push(filepath + '.unittest');
    }

    const mergeRecord = new Map();
    for (let filepath of filepaths) {
      filepath = this.resolveModule(filepath);
      if (!filepath) {
        continue;
      } else if (filepath.endsWith('/index.js')) {
        // TODO: remove support at next version
        deprecate(`app/extend/${name}/index.js is deprecated, use app/extend/${name}.js instead`);
      }

      const ext = this.requireFile(filepath);

      const properties = Object.getOwnPropertyNames(ext)
        .concat(Object.getOwnPropertySymbols(ext));

      for (const property of properties) {
        if (mergeRecord.has(property)) {
          debug('Property: "%s" already exists in "%s"，it will be redefined by "%s"',
            property, mergeRecord.get(property), filepath);
        }

        // Copy descriptor
        let descriptor = Object.getOwnPropertyDescriptor(ext, property);
        let originalDescriptor = Object.getOwnPropertyDescriptor(proto, property);
        if (!originalDescriptor) {
          // try to get descriptor from originalPrototypes
          const originalProto = originalPrototypes[name];
          if (originalProto) {
            originalDescriptor = Object.getOwnPropertyDescriptor(originalProto, property);
          }
        }
        if (originalDescriptor) {
          // don't override descriptor
          descriptor = Object.assign({}, descriptor);
          if (!descriptor.set && originalDescriptor.set) {
            descriptor.set = originalDescriptor.set;
          }
          if (!descriptor.get && originalDescriptor.get) {
            descriptor.get = originalDescriptor.get;
          }
        }
        Object.defineProperty(proto, property, descriptor);
        mergeRecord.set(property, filepath);
      }
      debug('merge %j to %s from %s', Object.keys(ext), name, filepath);
    }
    this.timing.end(`Load extend/${name}.js`);
  },
};
