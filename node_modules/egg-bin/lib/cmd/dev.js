'use strict';

const debug = require('debug')('egg-bin');
const Command = require('../command');
const path = require('path');
const utils = require('egg-utils');
const detect = require('detect-port');

class DevCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin dev [dir] [options]';

    this.defaultPort = 7001;
    this.serverBin = path.join(__dirname, '../start-cluster');

    this.options = {
      baseDir: {
        description: 'directory of application, default to `process.cwd()`',
        type: 'string',
      },
      workers: {
        description: 'numbers of app workers, default to 1 at local mode',
        type: 'number',
        alias: [ 'c', 'cluster' ],
        default: 1,
      },
      port: {
        description: 'listening port, default to 7001',
        type: 'number',
        alias: 'p',
      },
      framework: {
        description: 'specify framework that can be absolute path or npm package',
        type: 'string',
      },
      require: {
        description: 'will add to execArgv --require',
        type: 'array',
        alias: 'r',
      },
    };
  }

  get description() {
    return 'Start server at local dev mode';
  }

  get context() {
    const context = super.context;
    const { argv, execArgvObj } = context;
    execArgvObj.require = execArgvObj.require || [];
    // add require to execArgv
    if (argv.require) {
      execArgvObj.require.push(...argv.require);
      argv.require = undefined;
    }
    return context;
  }

  * run(context) {
    const devArgs = yield this.formatArgs(context);
    const env = {
      NODE_ENV: 'development',
      EGG_MASTER_CLOSE_TIMEOUT: 1000,
    };
    const options = {
      execArgv: context.execArgv,
      env: Object.assign(env, context.env),
    };
    debug('%s %j %j, %j', this.serverBin, devArgs, options.execArgv, options.env.NODE_ENV);
    yield this.helper.forkNode(this.serverBin, devArgs, options);
  }

  /**
   * format egg startCluster args then change it to json string style
   * @function helper#formatArgs
   * @param {Object} context - { cwd, argv }
   * @return {Array} pass to start-cluster, [ '{"port":7001,"framework":"egg"}' ]
   */
  * formatArgs(context) {
    const { cwd, argv } = context;
    /* istanbul ignore next */
    argv.baseDir = argv.baseDir || cwd;
    /* istanbul ignore next */
    if (!path.isAbsolute(argv.baseDir)) argv.baseDir = path.join(cwd, argv.baseDir);

    argv.port = argv.port || argv.p;
    argv.framework = utils.getFrameworkPath({
      framework: argv.framework,
      baseDir: argv.baseDir,
    });

    // remove unused properties
    argv.cluster = undefined;
    argv.c = undefined;
    argv.p = undefined;
    argv._ = undefined;
    argv.$0 = undefined;

    // auto detect available port
    if (!argv.port) {
      debug('detect available port');
      const port = yield detect(this.defaultPort);
      if (port !== this.defaultPort) {
        argv.port = port;
        console.warn(`[egg-bin] server port ${this.defaultPort} is in use, now using port ${port}\n`);
      }
      debug(`use available port ${port}`);
    }
    return [ JSON.stringify(argv) ];
  }
}

module.exports = DevCommand;
