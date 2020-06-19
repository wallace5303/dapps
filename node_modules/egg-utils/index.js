'use strict';

const fs = require('fs');
const path = require('path');
const utility = require('utility');

[
  require('./lib/framework'),
  require('./lib/plugin'),
  { getFrameworkOrEggPath },
]
  .forEach(obj => Object.assign(exports, obj));

/**
 * Try to get framework dir path
 * If can't find any framework, try to find egg dir path
 *
 * @param {String} cwd - current work path
 * @param {Array} [eggNames] - egg names, default is ['egg']
 * @return {String} framework or egg dir path
 * @deprecated
 */
function getFrameworkOrEggPath(cwd, eggNames) {
  eggNames = eggNames || [ 'egg' ];
  const moduleDir = path.join(cwd, 'node_modules');
  if (!fs.existsSync(moduleDir)) {
    return '';
  }

  // try to get framework

  // 1. try to read egg.framework property on package.json
  const pkgFile = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgFile)) {
    const pkg = utility.readJSONSync(pkgFile);
    if (pkg.egg && pkg.egg.framework) {
      return path.join(moduleDir, pkg.egg.framework);
    }
  }

  // 2. try the module dependencies includes eggNames
  const names = fs.readdirSync(moduleDir);
  for (const name of names) {
    const pkgfile = path.join(moduleDir, name, 'package.json');
    if (!fs.existsSync(pkgfile)) {
      continue;
    }
    const pkg = utility.readJSONSync(pkgfile);
    if (pkg.dependencies) {
      for (const eggName of eggNames) {
        if (pkg.dependencies[eggName]) {
          return path.join(moduleDir, name);
        }
      }
    }
  }

  // try to get egg
  for (const eggName of eggNames) {
    const pkgfile = path.join(moduleDir, eggName, 'package.json');
    if (fs.existsSync(pkgfile)) {
      return path.join(moduleDir, eggName);
    }
  }

  return '';
}
