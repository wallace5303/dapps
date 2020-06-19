'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('mz/fs');
const { existsSync } = require('fs');


/**
 * ViewManager will manage all view engine that is registered.
 *
 * It can find the real file, then retrieve the view engine based on extension.
 * The plugin just register view engine using {@link ViewManager#use}
 */
class ViewManager extends Map {

  /**
   * @param {Application} app - application instance
   */
  constructor(app) {
    super();
    this.config = app.config.view;
    this.config.root = this.config.root
      .split(/\s*,\s*/g)
      .filter(filepath => existsSync(filepath));
    this.extMap = new Map();
    this.fileMap = new Map();
    for (const ext of Object.keys(this.config.mapping)) {
      this.extMap.set(ext, this.config.mapping[ext]);
    }
  }

  /**
   * This method can register view engine.
   *
   * You can define a view engine class contains two method, `render` and `renderString`
   *
   * ```js
   * class View {
   *   render() {}
   *   renderString() {}
   * }
   * ```
   * @param {String} name - the name of view engine
   * @param {Object} viewEngine - the class of view engine
   */
  use(name, viewEngine) {
    assert(name, 'name is required');
    assert(!this.has(name), `${name} has been registered`);

    assert(viewEngine, 'viewEngine is required');
    assert(viewEngine.prototype.render, 'viewEngine should implement `render` method');
    assert(viewEngine.prototype.renderString, 'viewEngine should implement `renderString` method');

    this.set(name, viewEngine);
  }

  /**
   * Resolve the path based on the given name,
   * if the name is `user.html` and root is `app/view` (by default),
   * it will return `app/view/user.html`
   * @param {String} name - the given path name, it's relative to config.root
   * @return {String} filename - the full path
   */
  async resolve(name) {
    const config = this.config;

    // check cache
    let filename = this.fileMap.get(name);
    if (config.cache && filename) return filename;

    // try find it with default extension
    filename = await resolvePath([ name, name + config.defaultExtension ], config.root);
    assert(filename, `Can't find ${name} from ${config.root.join(',')}`);

    // set cache
    this.fileMap.set(name, filename);
    return filename;
  }
}

module.exports = ViewManager;

async function resolvePath(names, root) {
  for (const name of names) {
    for (const dir of root) {
      const filename = path.join(dir, name);
      if (await fs.exists(filename)) {
        if (inpath(dir, filename)) {
          return filename;
        }
      }
    }
  }
}

function inpath(parent, sub) {
  return sub.indexOf(parent) > -1;
}
