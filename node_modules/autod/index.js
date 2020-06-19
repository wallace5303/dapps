'use strict';

const debug = require('debug')('autod');
const assert = require('assert');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const readdir = require('fs-readdir-recursive');
const crequire = require('crequire');
const EventEmitter = require('events');
const co = require('co');
const urllib = require('urllib');
const semver = require('semver');

const DEFAULT_EXCLUDE = [ '.git', 'cov', 'coverage', '.vscode' ];
const DEFAULT_TEST = [ 'test', 'tests', 'test.js', 'benchmark', 'example', 'example.js' ];
const USER_AGENT = `autod@${require('./package').version} ${urllib.USER_AGENT}`;
const MODULE_REG = /^(@[0-9a-zA-Z\-\_][0-9a-zA-Z\.\-\_]*\/)?([0-9a-zA-Z\-\_][0-9a-zA-Z\.\-\_]*)/;


class Autod extends EventEmitter {
  constructor(options) {
    super();
    this.options = Object.assign({}, options);
    this.prepare();
  }

  prepare() {
    const options = this.options;
    assert(options.root, 'options.root required');
    // default options
    options.semver = options.semver || {};
    options.registry = options.registry || 'https://registry.npm.taobao.org';
    options.registry = options.registry.replace(/\/?$/, '');
    options.dep = options.dep || [];
    options.devdep = options.devdep || [];
    options.root = path.resolve(this.options.root);
    if (options.plugin) {
      try {
        const pluginPath = path.join(options.root, 'node_modules', options.plugin);
        options.plugin = require(pluginPath);
      } catch (err) {
        throw new Error(`plugin ${options.plugin} not exist!`);
      }
    }

    // parse exclude and test
    const exclude = (options.exclude || []).concat(DEFAULT_EXCLUDE);
    const test = (options.test || []).concat(DEFAULT_TEST);
    options.exclude = [];
    options.test = [];
    exclude.forEach(e => {
      options.exclude = options.exclude.concat(glob.sync(path.join(options.root, e)));
    });
    test.forEach(t => {
      options.test = options.test.concat(glob.sync(path.join(options.root, t)));
    });

    // store dependencies appear in which files
    this.dependencyMap = {};
    // store fetch npm error message
    this.errors = [];
    debug('autod inited with root: %s, exclude: %j, test: %j', options.root, options.exclude, options.test);
  }

  findJsFile() {
    const files = readdir(this.options.root, (name, index, dir) => {
      const fullname = path.join(dir, name);
      // ignore all node_modules
      if (fullname.indexOf('/node_modules/') >= 0) return false;
      // ignore specified exclude directories or files
      if (this._contains(fullname, this.options.exclude)) return false;

      if (fs.statSync(fullname).isDirectory()) return true;
      const extname = path.extname(name);
      if (extname !== '.js' && extname !== '.jsx') return false;
      return true;
    });

    const jsFiles = [];
    const jsTestFiles = [];
    files.forEach(file => {
      file = path.join(this.options.root, file);
      if (this._contains(file, this.options.test)) jsTestFiles.push(file);
      else jsFiles.push(file);
    });
    debug('findJsFile jsFiles(%j), jsTestFiles(%j)', jsFiles, jsTestFiles);
    return {
      jsFiles, jsTestFiles,
    };
  }

  findDependencies() {
    const files = this.findJsFile();
    const dependencies = new Set();
    const devDependencies = new Set();

    // add to dependencies set
    files.jsFiles.forEach(file => {
      const modules = this._getDependencies(file);
      modules.forEach(module => dependencies.add(module));
    });
    (this.options.dep || []).forEach(dev => {
      dependencies.add(dev);
    });

    // exclude dependencies, add to devDependencies set
    files.jsTestFiles.forEach(file => {
      const modules = this._getDependencies(file);
      modules.forEach(module => {
        if (!dependencies.has(module)) devDependencies.add(module);
      });
    });
    (this.options.devdep || []).forEach(dev => {
      if (!dependencies.has(module)) devDependencies.add(dev);
    });

    return {
      dependencies: Array.from(dependencies),
      devDependencies: Array.from(devDependencies),
    };
  }

  * findVersions() {
    const allDependencies = this.findDependencies();
    let versions = {};
    allDependencies.dependencies.forEach(name => {
      versions[name] = this._fetchVersion(name);
    });
    allDependencies.devDependencies.forEach(name => {
      versions[name] = this._fetchVersion(name);
    });
    versions = yield versions;
    const dependencies = {};
    const devDependencies = {};
    allDependencies.dependencies.forEach(name => {
      dependencies[name] = versions[name];
    });
    allDependencies.devDependencies.forEach(name => {
      devDependencies[name] = versions[name];
    });
    return { dependencies, devDependencies };
  }

  * _fetchVersion(name) {
    try {
      const tag = this.options.semver.hasOwnProperty(name)
        ? this.options.semver[name]
        : 'latest';


      let url = `${this.options.registry}/${name}/${tag}`;
      let isAllVersions = false;
      // npm don't support range now
      if (semver.validRange(tag)) {
        url = `${this.options.registry}/${name}`;
        isAllVersions = true;
      }
      const res = yield urllib.request(url, {
        headers: {
          'user-agent': USER_AGENT,
          // npm will response less data
          accept: 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*',
         },
        gzip: true,
        timeout: 10000,
        dataType: 'json',
      });
      if (res.status !== 200) {
        throw new Error(`request ${url} response status ${res.status}`);
      }
      let version;
      if (isAllVersions) {
      // match semver in local
        const versions = res.data && res.data.versions;
        if (versions) version = semver.maxSatisfying(Object.keys(versions), tag);
      } else {
        version = res.data && res.data.version;
      }
      if (!version) {
        throw new Error(`no match remote version for ${name}@${tag}`);
      }
      return version;
    } catch (err) {
      this.errors.push(err);
    }
  }

  _getDependencies(filePath) {
    let file;
    try {
      file = fs.readFileSync(filePath, 'utf-8');

      if (!this.options.notransform && file.includes('import')) {
        const res = require('babel-core').transform(file, {
          presets: [ require('babel-preset-react'), require('babel-preset-env'), require('babel-preset-stage-0') ],
        });
        file = res.code;
      }
    } catch (err) {
      this.emit('warn', `Read(or transfrom) file ${filePath} error: ${err.message}`);
    }
    const modules = [];

    crequire(file, true).forEach(r => {
      const parsed = MODULE_REG.exec(r.path);
      if (!parsed) return;
      const scope = parsed[1];
      let name = parsed[2];
      if (scope) name = scope + name;
      if (this._isCoreModule(name)) return;
      modules.push(name);
      this.dependencyMap[name] = this.dependencyMap[name] || [];
      this.dependencyMap[name].push(filePath);
    });

    // support plugin parse file
    if (this.options.plugin) {
      const pluginModules = this.options.plugin(filePath, file, modules) || [];
      pluginModules.forEach(name => {
        modules.push(name);
        this.dependencyMap[name] = this.dependencyMap[name] || [];
        this.dependencyMap[name].push(filePath);
      });
    }

    debug('file %s get modules %j', filePath, modules);
    return modules;
  }

  _contains(path, matchs) {
    for (const match of matchs) {
      if (path.startsWith(match)) return true;
    }
  }

  _isCoreModule(name) {
    let filename;
    try {
      filename = require.resolve(name);
    } catch (err) {
      return false;
    }
    return filename === name;
  }
}

Autod.prototype.findVersions = co.wrap(Autod.prototype.findVersions);

module.exports = Autod;
