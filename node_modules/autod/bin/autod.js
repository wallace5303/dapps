#!/usr/bin/env node

'use strict';

const resolve = require('path').resolve;
const pkg = require('../package.json');
const printable = require('printable');
const minimatch = require('minimatch');
const program = require('commander');
const pjoin = require('path').join;
const util = require('util');
const path = require('path');
const Autod = require('..');
const fs = require('fs');
require('colors');

const argv = program
  .version(pkg.version)
  .option('-p, --path [root path]', 'the root path to be parse', '.')
  .option('-t, --test <test/benchmark/example directory paths>', 'modules in these paths will be tread as devDependencies')
  .option('-e, --exclude <exclude directory path>', 'exclude parse directory, split by `,`')
  .option('-r, --registry <remote registry>', 'get latest version from which registry')
  .option('-f, --prefix [version prefix]', 'version prefix, can be `~` or `^`')
  .option('-F, --devprefix [dev dependencies version prefix]', 'develop dependencies version prefix, can be `~` or `^`')
  .option('-w, --write', 'write dependencies into package.json')
  .option('-i, --ignore', 'ignore errors, display the dependencies or write the dependencies.')
  .option('-m, --map', 'display all the dependencies require by which file')
  .option('-d, --dep <dependently modules>', 'modules that not require in source file, but you need them as dependencies')
  .option('-D, --devdep <dev dependently modules>', 'modules that not require in source file, but you need them in as devDependencies')
  .option('-k, --keep <dependently modules>', 'modules that you want to keep version in package.json file')
  .option('-s, --semver <dependencies@version>', 'auto update these modules within the specified semver')
  .option('-n, --notransform', 'disable transfrom es next, don\'t support es6 modules')
  .option('-P, --plugin <name>', 'plugin module name')
  .option('--check', 'check missing dependencies and devDependencies')
  .parse(process.argv);

let options = {};
let confPath;
try {
  confPath = require.resolve(path.resolve('.autod.conf'));
  options = require(confPath);
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    console.error('load config %s error:', confPath);
    console.error(err.stack);
  }
  // ignore
}

for (const key in argv) {
  if (argv[key] !== undefined) {
    options[key] = argv[key];
  }
}

[ 'exclude', 'dep', 'devdep', 'test', 'keep' ].forEach(function(key) {
  options[key] = split(options[key]);
});

options.semver = processSemver(options.semver);

if (options.prefix && options.prefix !== '^') {
  options.prefix = '~';
}
if (options.devprefix && options.devprefix !== '^') {
  options.devprefix = '~';
}

options.root = options.path = options.path || '.';

// don't write when check
if (options.check) options.write = false;

// get registry from pacakge.json
// default to Chinese Mirror
if (!options.registry) {
  let modulePackage;
  try {
    modulePackage = fs.readFileSync('package.json', 'utf8');
    modulePackage = JSON.parse(modulePackage);
  } catch (err) {
    modulePackage = {};
  }

  options.registry = 'https://registry.npmjs.org';
  // get from npm env
  if (process.env.npm_config_registry) options.registry = process.env.npm_config_registry;
  // get from package.json
  if (modulePackage.publishConfig && modulePackage.publishConfig.registry) {
    options.registry = modulePackage.publishConfig.registry;
  }
}

const autod = new Autod(options);
if (options.check) {
  const allDeps = autod.findDependencies();
  const result = { dependencies: {}, devDependencies: {} };
  allDeps.dependencies.forEach(dep => {
    result.dependencies[dep] = true;
  });
  allDeps.devDependencies.forEach(dep => {
    result.devDependencies[dep] = true;
  });
  comparePackage(result);
} else {
  autod.findVersions().then(result => {
    result.map = autod.dependencyMap;
    if (autod.errors.length) {
      autod.errors.forEach(err => {
        console.error('[ERROR]'.red, err.message);
      });
      if (!options.ignore) process.exit(1);
    }
    log('\n[DEPENDENCIES]\n'.green);
    comparePackage(result);
    if (options.map) {
      log('\n[DEPENDENCY MAP]'.green);
      printDependencyMap(result.map);
    }
  });
}

function comparePackage(result) {
  let pkgInfo;
  let pkgStr;
  let pkgExist = true;
  const pkgPath = pjoin(resolve(options.path), 'package.json');

  // add prefix
  if (options.prefix) {
    for (const key in result.dependencies) {
      result.dependencies[key] = options.prefix + result.dependencies[key];
    }
  }
  const devprefix = options.devprefix ? options.devprefix : options.prefix;
  if (devprefix) {
    for (const key in result.devDependencies) {
      result.devDependencies[key] = devprefix + result.devDependencies[key];
    }
  }

  try {
    pkgInfo = require(pkgPath);
    pkgStr = fs.readFileSync(pkgPath, 'utf-8');
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      pkgInfo = {};
      pkgExist = false;
    } else {
      log(output(result));
      console.error('`package.json` parsed error: %s', err.message);
      process.exit(1);
    }
  }

  if (!pkgExist) {
    log(output(result));
    if (options.write) {
      console.log('[WARN]'.yellow + ' `package.json` not exist, auto generate and write dependencies.');
      fs.writeFileSync(pkgPath, '{\n' + output(result) + '\n}\n', 'utf-8');
    }
    process.exit(0);
  }

  if (options.keep) {
    // keep these modules version, won't change by autod
    options.keep.forEach(function(key) {
      for (const pkgKey in result.dependencies) {
        if (minimatch(pkgKey, key)) {
          delete result.dependencies[pkgKey];
        }
      }
      for (const pkgKey in result.devDependencies) {
        if (minimatch(pkgKey, key)) {
          delete result.devDependencies[pkgKey];
        }
      }

      const dependencies = pkgInfo.dependencies;
      const devDependencies = pkgInfo.devDependencies;
      for (const pkgKey in dependencies) {
        if (minimatch(pkgKey, key)) {
          result.dependencies[pkgKey] = dependencies[pkgKey];
        }
      }

      for (const pkgKey in devDependencies) {
        if (minimatch(pkgKey, key)) {
          result.devDependencies[key] = devDependencies[key];
        }
      }
    });
  }

  if (pkgInfo.dependencies) {
    pkgStr = pkgStr.replace(/( |\t)*"dependencies"\s*:\s*{(.|\n)*?}/,
      outputDep('dependencies', result.dependencies));
  } else {
    pkgStr = pkgStr.replace(/(\s*)(\}\n*\s*)$/, function(end, before, after) {
      return ',' + before + outputDep('dependencies', result.dependencies) + '\n' + after;
    });
  }

  if (pkgInfo.devDependencies) {
    // merge parsed into devDependencies
    for (const key in pkgInfo.devDependencies) {
      if (!result.devDependencies[key]) {
        result.devDependencies[key] = pkgInfo.devDependencies[key];
      }
    }
    pkgStr = pkgStr.replace(/( |\t)*"devDependencies"\s*:\s*{(.|\n)*?}/,
      outputDep('devDependencies', result.devDependencies));
  } else {
    pkgStr = pkgStr.replace(/(\s*)(\}\n*\s*)$/, function(end, before, after) {
      return ',' + before + outputDep('devDependencies', result.devDependencies) + '\n' + after;
    });
  }
  log(output(result));
  printUpdates('Dependencies', result.dependencies, pkgInfo.dependencies, true);
  printUpdates('DevDependencies', result.devDependencies, pkgInfo.devDependencies);

  if (options.write) {
    console.log('[INFO]'.green + ' Write dependencies into package.json.');
    fs.writeFileSync(pkgPath, pkgStr, 'utf-8');
  }

  if (options.check) {
    const missingDependencies = [];
    const missingDevDependencies = [];
    const deps = result.dependencies || {};
    const old = pkgInfo.dependencies || {};
    for (const key in deps) {
      if (!old[key]) {
        missingDependencies.push(key);
      }
    }
    const devDeps = result.devDependencies || {};
    const devOld = pkgInfo.devDependencies || {};
    for (const key in devDeps) {
      if (!devOld[key] && !old[key]) {
        missingDevDependencies.push(key);
      }
    }

    if (missingDependencies.length > 0) {
      console.error('[ERROR]'.red + ' Missing dependencies: ' +
        JSON.stringify(missingDependencies) + '\n');
    }
    if (missingDevDependencies.length > 0) {
      console.error('[ERROR]'.red + ' Missing devDependencies: ' +
        JSON.stringify(missingDevDependencies) + '\n');
    }
    if (missingDependencies.length > 0 || missingDevDependencies.length > 0) {
      process.exit(1);
    }
  }
}

function processSemver(semver) {
  semver = semver || [];
  if (typeof semver === 'string') {
    semver = semver.split(/\s*,\s*/);
  }
  const map = {};

  semver.forEach(function(m) {
    let prefix = '';
    if (m.indexOf('@') === 0) {
      prefix = '@';
      m = m.slice(1);
    }

    m = m.split('@');
    if (m.length !== 2) return;
    map[prefix + m[0]] = m[1];
  });
  return map;
}

function outputDep(name, values) {
  let str = util.format('  "%s": {\n', name);
  const deps = [];
  for (const key in values) {
    deps.push(util.format('    "%s": "%s"', key, values[key]));
  }
  str += deps.sort().join(',\n') + '\n  }';
  return str;
}

function output(result) {
  let str = outputDep('dependencies', result.dependencies);
  if (!Object.keys(result.devDependencies).length) {
    return str;
  }
  str += ',\n' + outputDep('devDependencies', result.devDependencies);
  return str;
}

function printUpdates(title, latest, old, remove) {
  latest = latest || {};
  old = old || {};
  const arr = [[ 'Package Name', 'Old Version', 'Latest Version' ]];
  for (const key in latest) {
    if (!old[key]) {
      arr.push([ key, '-', latest[key] ]);
    } else if (old[key] !== latest[key]) {
      arr.push([ key, old[key], latest[key] ]);
    }
  }
  if (remove) {
    for (const key in old) {
      if (!latest[key]) {
        arr.push([ key, old[key], 'remove' ]);
      }
    }
  }
  if (arr.length > 1) {
    log((title + ' updates').yellow + '\n');
    log(printable.print(arr));
    log();
  } else {
    log(('nothing to update in ' + title).green + '\n');
  }
}

function printDependencyMap(map) {
  Object.keys(map).sort().forEach(function(name) {
    console.log(('  ' + name).cyan);
    console.log(('    ' + map[name].join('\n    ')).grey);
  });
}

function split(str) {
  if (typeof str === 'string') {
    return str.split(/\s*,\s*/);
  }
  return str;
}

function log() {
  if (options.check) return;
  console.log.apply(console, arguments);
}
