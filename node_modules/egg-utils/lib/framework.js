'use strict';

const path = require('path');
const assert = require('assert');
const fs = require('fs');
const utility = require('utility');

const initCwd = process.cwd();

module.exports = { getFrameworkPath };

/**
 * Find the framework directory, lookup order
 * - specify framework path
 * - get framework name from
 * - use egg by default
 * @param {Object} options - options
 * @param  {String} options.baseDir - the current directory of application
 * @param  {String} [options.framework] - the directory of framework
 * @return {String} frameworkPath
 */
function getFrameworkPath({ framework, baseDir }) {
  const pkgPath = path.join(baseDir, 'package.json');
  assert(fs.existsSync(pkgPath), `${pkgPath} should exist`);

  const moduleDir = path.join(baseDir, 'node_modules');
  const pkg = utility.readJSONSync(pkgPath);

  // 1. pass framework or customEgg
  if (framework) {
    // 1.1 framework is an absolute path
    // framework: path.join(baseDir, 'node_modules/${frameworkName}')
    if (path.isAbsolute(framework)) {
      assert(fs.existsSync(framework), `${framework} should exist`);
      return framework;
    }
    // 1.2 framework is a npm package that required by application
    // framework: 'frameworkName'
    return assertAndReturn(framework, moduleDir);
  }

  // 2. framework is not specified
  // 2.1 use framework name from pkg.egg.framework
  if (pkg.egg && pkg.egg.framework) {
    return assertAndReturn(pkg.egg.framework, moduleDir);
  }

  // 2.2 use egg by default
  return assertAndReturn('egg', moduleDir);
}

function assertAndReturn(frameworkName, moduleDir) {
  const moduleDirs = new Set([
    moduleDir,
    // find framework from process.cwd, especially for test,
    // the application is in test/fixtures/app,
    // and framework is install in ${cwd}/node_modules
    path.join(process.cwd(), 'node_modules'),
    // prevent from mocking process.cwd
    path.join(initCwd, 'node_modules'),
  ]);
  for (const moduleDir of moduleDirs) {
    const frameworkPath = path.join(moduleDir, frameworkName);
    if (fs.existsSync(frameworkPath)) return frameworkPath;
  }
  throw new Error(`${frameworkName} is not found in ${Array.from(moduleDirs)}`);
}
