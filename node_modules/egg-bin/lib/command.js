'use strict';

const path = require('path');
const fs = require('fs');
const BaseCommand = require('common-bin');

class Command extends BaseCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.parserOptions = {
      execArgv: true,
      removeAlias: true,
    };

    // common-bin setter, don't care about override at sub class
    // https://github.com/node-modules/common-bin/blob/master/lib/command.js#L158
    this.options = {
      typescript: {
        description: 'whether enable typescript support, will load `ts-node/register` etc',
        type: 'boolean',
        alias: 'ts',
        default: undefined,
      },

      declarations: {
        description: 'whether create dts, will load `egg-ts-helper/register`',
        type: 'boolean',
        alias: 'dts',
        default: undefined,
      },
    };
  }

  /**
   * default error handler
   * @param {Error} err - err obj
   */
  errorHandler(err) {
    console.error(err);
    process.nextTick(() => process.exit(1));
  }

  get context() {
    const context = super.context;
    const { argv, debugPort, execArgvObj, cwd, env } = context;

    // compatible
    if (debugPort) context.debug = debugPort;

    // remove unuse args
    argv.$0 = undefined;

    // read package.json
    let baseDir = argv.baseDir || cwd;
    if (!path.isAbsolute(baseDir)) baseDir = path.join(cwd, baseDir);
    const pkgFile = path.join(baseDir, 'package.json');
    const pkgInfo = fs.existsSync(pkgFile) ? require(pkgFile) : null;
    const eggInfo = pkgInfo && pkgInfo.egg;
    execArgvObj.require = execArgvObj.require || [];

    // read `egg.typescript` from package.json if not pass argv
    if (argv.typescript === undefined && eggInfo) {
      argv.typescript = eggInfo.typescript === true;
    }

    // read `egg.declarations` from package.json if not pass argv
    if (argv.declarations === undefined && eggInfo) {
      argv.declarations = eggInfo.declarations === true;
    }

    // read `egg.require` from package.json
    if (eggInfo && eggInfo.require && Array.isArray(eggInfo.require)) {
      execArgvObj.require = execArgvObj.require.concat(eggInfo.require);
    }

    // load ts-node
    if (argv.typescript) {
      execArgvObj.require.push(require.resolve('ts-node/register'));

      // tell egg loader to load ts file
      env.EGG_TYPESCRIPT = 'true';

      // use type check
      env.TS_NODE_TYPE_CHECK = process.env.TS_NODE_TYPE_CHECK || 'true';

      // load files from tsconfig on startup
      env.TS_NODE_FILES = process.env.TS_NODE_FILES || 'true';
    }

    // load egg-ts-helper
    if (argv.declarations) {
      execArgvObj.require.push(require.resolve('egg-ts-helper/register'));
    }

    return context;
  }
}

module.exports = Command;
