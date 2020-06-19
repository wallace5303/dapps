'use strict';

const path = require('path');
const fs = require('mz/fs');
const XMLMapping = require('xml-mapping');
const mkdirp = require('mkdirp');
const _ = require('lodash');

module.exports = class Command {
  * run(cwd) {
    this.cwd = cwd;
    this.pkgInfo = this.getPkgInfo();
    this.appName = path.basename(this.cwd);
    this.ideaPath = path.join(this.cwd, '.idea');
    this.config = this.pkgInfo.config && this.pkgInfo.config.webstorm || {};


    mkdirp.sync(this.ideaPath);

    // SINGLE CONFIG
    yield this.initModules();
    yield this.initLibrary();
    yield this.initMisc();

    // MULTI CONFIG BEGIN
    const configs = [ this.pkgInfo ];
    if (this.config.modules) {
      for (const moduleName of this.config.modules) {
        const pkgInfo = require(path.join(this.cwd, moduleName, 'package.json'));
        pkgInfo.__moduleName = moduleName;
        configs.push(pkgInfo);
      }
    }

    for (const pkgInfo of configs) {
      pkgInfo.config = pkgInfo.config || {};
      pkgInfo.config.webstorm = pkgInfo.config.webstorm || {};
      yield this.initApp({
        indexArray: pkgInfo.config.webstorm.index || [],
        moduleName: pkgInfo.__moduleName,
      });
    }
  }

  * initApp(params) {
    const moduleName = params.moduleName;
    const indexArray = params.indexArray;
    const fileName = this.appName + '.iml';
    const appConfig = yield this.loadXML(fileName);

    // console.log('%j', appConfig);

    const moduleNode = this.normalizeNode(appConfig, 'module', { type: 'WEB_MODULE' });
    moduleNode.version = moduleNode.version || '4';

    const componentNode = this.normalizeNode(moduleNode, 'component', { name: 'NewModuleRootManager' });
    const contentNode = this.normalizeNode(componentNode, 'content', { url: 'file://$MODULE_DIR$' });

    let basePath = 'file://$MODULE_DIR$';
    if (moduleName) {
      basePath = `${basePath}/${moduleName}`;
    }

    // console.log(contentNode.excludeFolder);
    const excludeFolderNode = contentNode.excludeFolder = [].concat(contentNode.excludeFolder || []);
    [ '.tmp', 'temp', 'tmp', 'node_modules', 'coverage', 'logs' ].forEach(key => excludeFolderNode.push({ url: `${basePath}/${key}` }));

    // console.log(excludeFolderNode);

    indexArray.forEach(key => {
      componentNode.content.push({ url: `${basePath}/node_modules/${key}` });
      excludeFolderNode.push({ url: `${basePath}/node_modules/${key}/node_modules` });
    });

    this.uniqArray(excludeFolderNode, 'url');
    this.uniqArray(componentNode.content, 'url');
    yield this.saveXML(fileName, appConfig);
  }

  * initModules() {
    const fileName = 'modules.xml';

    const modulesConfig = yield this.loadXML(fileName);
    const projectNode = this.normalizeNode(modulesConfig, 'project', { version: '4' });

    const componentNode = this.normalizeNode(projectNode, 'component', { name: 'ProjectModuleManager' });
    componentNode.modules = componentNode.modules || {};

    const key = `$PROJECT_DIR$/.idea/${this.appName}.iml`;
    const moduleNode = this.normalizeNode(componentNode.modules, 'module', { filepath: key });
    moduleNode.fileurl = `file://${key}`;

    yield this.saveXML(fileName, modulesConfig);
  }

  * initLibrary() {
    const fileName = 'jsLibraryMappings.xml';
    const libraryConfig = yield this.loadXML(fileName);
    const projectNode = this.normalizeNode(libraryConfig, 'project', { version: '4' });

    const componentNode = this.normalizeNode(projectNode, 'component', { name: 'JavaScriptLibraryMappings' });

    this.normalizeNode(componentNode, 'excludedPredefinedLibrary', { name: `${this.appName}/node_modules` });

    const includeNode = componentNode.includedPredefinedLibrary = [].concat(componentNode.includedPredefinedLibrary || []);
    _.remove(includeNode, item => item.name === `${this.appName}/node_modules`);
    [ 'ECMAScript 6', 'Node.js Core' ].forEach(key => includeNode.push({ name: key }));
    this.uniqArray(includeNode, 'name');

    const fileNode = this.normalizeNode(componentNode, 'file', { url: 'PROJECT' });
    const libraries = (fileNode.libraries || '')
      .replace(/^\{\s*/, '')
      .replace(/}\s*$/, '')
      .split(',')
      .map(item => item.trim())
      .filter(item => item)
      .concat('node-DefinitelyTyped', 'mocha-DefinitelyTyped');
    fileNode.libraries = '{' + _.uniq(libraries).join(',') + '}';

    yield this.saveXML(fileName, libraryConfig);
  }

  * initMisc() {
    const fileName = 'misc.xml';

    const miscConfig = yield this.loadXML(fileName);
    const projectNode = this.normalizeNode(miscConfig, 'project', { version: '4' });

    const componentNode = this.normalizeNode(projectNode, 'component', { name: 'JavaScriptSettings' });
    const langNode = this.normalizeNode(componentNode, 'option', { name: 'languageLevel' });
    langNode.value = 'ES6';

    yield this.saveXML(fileName, miscConfig);
  }

  * loadXML(fileName, opts) {
    const filePath = path.join(this.ideaPath, fileName);
    const isExist = yield fs.exists(filePath);
    if (!isExist) {
      return {};
    } else {
      const content = yield fs.readFile(filePath, 'utf-8');
      const json = XMLMapping.load(content, opts);
      return json;
    }
  }

  * saveXML(fileName, content) {
    const xml = XMLMapping.dump(content, {
      header: true,
      indent: true,
    });
    yield this.writeFile(fileName, xml);
  }

  * writeFile(fileName, content) {
    const filePath = path.join(this.cwd, '.idea', fileName);
    console.log('[webstorm-disable-index] write to', fileName);
    yield fs.writeFile(filePath, content, 'utf-8');
  }

  getPkgInfo() {
    try {
      return require(path.join(this.cwd, 'package.json'));
    } catch (err) {
      console.warn('[webstorm-disable-index] package.json not found at ' + this.cwd);
      return { name: 'webstorm-disable-index' };
    }
  }

  // if parent don't have property `key`, then create it
  // if `key` is not array, then change to array
  // use `query` to find item in array
  // if not found, create it and push to array
  // return it
  normalizeNode(parent, key, query) {
    const node = parent[key] = [].concat(parent[key] || []);
    let targetNode = _.find(node, query);
    if (!targetNode) {
      targetNode = query;
      node.push(targetNode);
    }
    return targetNode;
  }

  uniqArray(arr, key) {
    const newArray = _.uniqBy(arr, key);
    arr.splice(0, arr.length);
    Array.prototype.splice.apply(arr, [ 0, arr.length ].concat(newArray));
    return arr;
  }
};
