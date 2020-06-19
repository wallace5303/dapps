'use strict';

const path = require('path');
const assert = require('assert');

const RENDER = Symbol.for('contextView#render');
const RENDER_STRING = Symbol.for('contextView#renderString');
const GET_VIEW_ENGINE = Symbol.for('contextView#getViewEngine');
const SET_LOCALS = Symbol.for('contextView#setLocals');

/**
 * View instance for each request.
 *
 * It will find the view engine, and render it.
 * The view engine should be registered in {@link ViewManager}.
 */
class ContextView {
  constructor(ctx) {
    this.ctx = ctx;
    this.app = this.ctx.app;
    this.viewManager = ctx.app.view;
    this.config = ctx.app.view.config;
  }

  /**
   * Render a file by view engine
   * @param {String} name - the file path based on root
   * @param {Object} [locals] - data used by template
   * @param {Object} [options] - view options, you can use `options.viewEngine` to specify view engine
   * @return {Promise<String>} result - return a promise with a render result
   */
  render(...args) {
    return this[RENDER](...args);
  }

  /**
   * Render a template string by view engine
   * @param {String} tpl - template string
   * @param {Object} [locals] - data used by template
   * @param {Object} [options] - view options, you can use `options.viewEngine` to specify view engine
   * @return {Promise<String>} result - return a promise with a render result
   */
  renderString(...args) {
    return this[RENDER_STRING](...args);
  }

  // ext -> viewEngineName -> viewEngine
  async [RENDER](name, locals, options = {}) {
    // retrieve fullpath matching name from `config.root`
    const filename = await this.viewManager.resolve(name);
    options.name = name;
    options.root = filename.replace(path.normalize(name), '').replace(/[\/\\]$/, '');
    options.locals = locals;

    // get the name of view engine,
    // if viewEngine is specified in options, don't match extension
    let viewEngineName = options.viewEngine;
    if (!viewEngineName) {
      const ext = path.extname(filename);
      viewEngineName = this.viewManager.extMap.get(ext);
    }
    // use the default view engine that is configured if no matching above
    if (!viewEngineName) {
      viewEngineName = this.config.defaultViewEngine;
    }
    assert(viewEngineName, `Can't find viewEngine for ${filename}`);

    // get view engine and render
    const view = this[GET_VIEW_ENGINE](viewEngineName);
    return await view.render(filename, this[SET_LOCALS](locals), options);
  }

  [RENDER_STRING](tpl, locals, options) {
    let viewEngineName = options && options.viewEngine;
    if (!viewEngineName) {
      viewEngineName = this.config.defaultViewEngine;
    }
    assert(viewEngineName, 'Can\'t find viewEngine');

    // get view engine and render
    const view = this[GET_VIEW_ENGINE](viewEngineName);
    return view.renderString(tpl, this[SET_LOCALS](locals), options);
  }

  [GET_VIEW_ENGINE](name) {
    // get view engine
    const ViewEngine = this.viewManager.get(name);
    assert(ViewEngine, `Can't find ViewEngine "${name}"`);

    // use view engine to render
    const engine = new ViewEngine(this.ctx);
    // wrap render and renderString to support both async function and generator function
    if (engine.render) engine.render = this.app.toAsyncFunction(engine.render);
    if (engine.renderString) engine.renderString = this.app.toAsyncFunction(engine.renderString);
    return engine;
  }

  /**
   * set locals for view, inject `locals.ctx`, `locals.request`, `locals.helper`
   * @param {Object} locals - locals
   * @return {Object} locals
   * @private
   */
  [SET_LOCALS](locals) {
    return Object.assign({
      ctx: this.ctx,
      request: this.ctx.request,
      helper: this.ctx.helper,
    }, this.ctx.locals, locals);
  }
}

module.exports = ContextView;
