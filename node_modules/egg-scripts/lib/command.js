'use strict';

const fs = require('fs');
const path = require('path');
const BaseCommand = require('common-bin');
const Logger = require('zlogger');
const helper = require('./helper');

class Command extends BaseCommand {
  constructor(rawArgv) {
    super(rawArgv);

    Object.assign(this.helper, helper);

    this.parserOptions = {
      removeAlias: true,
      removeCamelCase: true,
      execArgv: true,
    };

    // common-bin setter, don't care about override at sub class
    // https://github.com/node-modules/common-bin/blob/master/lib/command.js#L158
    this.options = {
      sourcemap: {
        description: 'whether enable sourcemap support, will load `source-map-support` etc',
        type: 'boolean',
        alias: [ 'ts', 'typescript' ],
      },
    };

    this.logger = new Logger({
      prefix: '[egg-scripts] ',
      time: false,
    });
  }

  get context() {
    const context = super.context;
    const { argv, execArgvObj, cwd } = context;

    // read `egg.typescript` from package.json
    let baseDir = argv._[0] || cwd;
    if (!path.isAbsolute(baseDir)) baseDir = path.join(cwd, baseDir);
    const pkgFile = path.join(baseDir, 'package.json');
    if (fs.existsSync(pkgFile)) {
      const pkgInfo = require(pkgFile);
      if (pkgInfo && pkgInfo.egg && pkgInfo.egg.typescript) {
        argv.sourcemap = true;
      }

      // read argv from eggScriptsConfig in package.json
      if (pkgInfo && pkgInfo.eggScriptsConfig && typeof pkgInfo.eggScriptsConfig === 'object') {
        for (const key in pkgInfo.eggScriptsConfig) {
          if (argv[key] == null) argv[key] = pkgInfo.eggScriptsConfig[key];
        }
      }
    }

    // execArgv
    if (argv.sourcemap) {
      execArgvObj.require = execArgvObj.require || [];
      execArgvObj.require.push(require.resolve('source-map-support/register'));
    }

    argv.sourcemap = argv.typescript = argv.ts = undefined;

    return context;
  }

  exit(code) {
    process.exit(code);
  }
}

module.exports = Command;
