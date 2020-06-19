'use strict';

const debug = require('debug')('common-bin');
const co = require('co');
const yargs = require('yargs');
const parser = require('yargs-parser');
const helper = require('./helper');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const changeCase = require('change-case');
const chalk = require('chalk');

const DISPATCH = Symbol('Command#dispatch');
const PARSE = Symbol('Command#parse');
const COMMANDS = Symbol('Command#commands');
const VERSION = Symbol('Command#version');

class CommonBin {
  constructor(rawArgv) {
    /**
     * original argument
     * @type {Array}
     */
    this.rawArgv = rawArgv || process.argv.slice(2);
    debug('[%s] origin argument `%s`', this.constructor.name, this.rawArgv.join(' '));

    /**
     * yargs
     * @type {Object}
     */
    this.yargs = yargs(this.rawArgv);

    /**
     * helper function
     * @type {Object}
     */
    this.helper = helper;

    /**
     * parserOptions
     * @type {Object}
     * @property {Boolean} execArgv - whether extract `execArgv` to `context.execArgv`
     * @property {Boolean} removeAlias - whether remove alias key from `argv`
     * @property {Boolean} removeCamelCase - whether remove camel case key from `argv`
     */
    this.parserOptions = {
      execArgv: false,
      removeAlias: false,
      removeCamelCase: false,
    };

    // <commandName, Command>
    this[COMMANDS] = new Map();
  }

  /**
   * command handler, could be generator / async function / normal function which return promise
   * @param {Object} context - context object
   * @param {String} context.cwd - process.cwd()
   * @param {Object} context.argv - argv parse result by yargs, `{ _: [ 'start' ], '$0': '/usr/local/bin/common-bin', baseDir: 'simple'}`
   * @param {Array} context.rawArgv - the raw argv, `[ "--baseDir=simple" ]`
   * @protected
   */
  run() {
    this.showHelp();
  }

  /**
   * load sub commands
   * @param {String} fullPath - the command directory
   * @example `load(path.join(__dirname, 'command'))`
   */
  load(fullPath) {
    assert(fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory(),
      `${fullPath} should exist and be a directory`);

    // load entire directory
    const files = fs.readdirSync(fullPath);
    const names = [];
    for (const file of files) {
      if (path.extname(file) === '.js') {
        const name = path.basename(file).replace(/\.js$/, '');
        names.push(name);
        this.add(name, path.join(fullPath, file));
      }
    }

    debug('[%s] loaded command `%s` from directory `%s`',
      this.constructor.name, names, fullPath);
  }

  /**
   * add sub command
   * @param {String} name - a command name
   * @param {String|Class} target - special file path (must contains ext) or Command Class
   * @example `add('test', path.join(__dirname, 'test_command.js'))`
   */
  add(name, target) {
    assert(name, `${name} is required`);
    if (!(target.prototype instanceof CommonBin)) {
      assert(fs.existsSync(target) && fs.statSync(target).isFile(), `${target} is not a file.`);
      debug('[%s] add command `%s` from `%s`', this.constructor.name, name, target);
      target = require(target);
      // try to require es module
      if (target && target.__esModule && target.default) {
        target = target.default;
      }
      assert(target.prototype instanceof CommonBin,
        'command class should be sub class of common-bin');
    }
    this[COMMANDS].set(name, target);
  }

  /**
   * alias an existing command
   * @param {String} alias - alias command
   * @param {String} name - exist command
   */
  alias(alias, name) {
    assert(alias, 'alias command name is required');
    assert(this[COMMANDS].has(name), `${name} should be added first`);
    debug('[%s] set `%s` as alias of `%s`', this.constructor.name, alias, name);
    this[COMMANDS].set(alias, this[COMMANDS].get(name));
  }

  /**
   * start point of bin process
   */
  start() {
    co(function* () {
      // replace `--get-yargs-completions` to our KEY, so yargs will not block our DISPATCH
      const index = this.rawArgv.indexOf('--get-yargs-completions');
      if (index !== -1) {
        // bash will request as `--get-yargs-completions my-git remote add`, so need to remove 2
        this.rawArgv.splice(index, 2, `--AUTO_COMPLETIONS=${this.rawArgv.join(',')}`);
      }
      yield this[DISPATCH]();
    }.bind(this)).catch(this.errorHandler.bind(this));
  }

  /**
   * default error hander
   * @param {Error} err - error object
   * @protected
   */
  errorHandler(err) {
    console.error(chalk.red(`⚠️  ${err.name}: ${err.message}`));
    console.error(chalk.red('⚠️  Command Error, enable `DEBUG=common-bin` for detail'));
    debug('args %s', process.argv.slice(3));
    debug(err.stack);
    process.exit(1);
  }

  /**
   * print help message to console
   * @param {String} [level=log] - console level
   */
  showHelp(level = 'log') {
    this.yargs.showHelp(level);
  }

  /**
   * shortcut for yargs.options
   * @param  {Object} opt - an object set to `yargs.options`
   */
  set options(opt) {
    this.yargs.options(opt);
  }

  /**
   * shortcut for yargs.usage
   * @param  {String} usage - usage info
   */
  set usage(usage) {
    this.yargs.usage(usage);
  }

  set version(ver) {
    this[VERSION] = ver;
  }

  get version() {
    return this[VERSION];
  }

  /**
   * instantiaze sub command
   * @param {CommonBin} Clz - sub command class
   * @param {Array} args - args
   * @return {CommonBin} sub command instance
   */
  getSubCommandInstance(Clz, ...args) {
    return new Clz(...args);
  }

  /**
   * dispatch command, either `subCommand.exec` or `this.run`
   * @param {Object} context - context object
   * @param {String} context.cwd - process.cwd()
   * @param {Object} context.argv - argv parse result by yargs, `{ _: [ 'start' ], '$0': '/usr/local/bin/common-bin', baseDir: 'simple'}`
   * @param {Array} context.rawArgv - the raw argv, `[ "--baseDir=simple" ]`
   * @private
   */
  * [DISPATCH]() {
    // define --help and --version by default
    this.yargs
      // .reset()
      .completion()
      .help()
      .version()
      .wrap(120)
      .alias('h', 'help')
      .alias('v', 'version')
      .group([ 'help', 'version' ], 'Global Options:');

    // get parsed argument without handling helper and version
    const parsed = yield this[PARSE](this.rawArgv);
    const commandName = parsed._[0];

    if (parsed.version && this.version) {
      console.log(this.version);
      return;
    }

    // if sub command exist
    if (this[COMMANDS].has(commandName)) {
      const Command = this[COMMANDS].get(commandName);
      const rawArgv = this.rawArgv.slice();
      rawArgv.splice(rawArgv.indexOf(commandName), 1);

      debug('[%s] dispatch to subcommand `%s` -> `%s` with %j', this.constructor.name, commandName, Command.name, rawArgv);
      const command = this.getSubCommandInstance(Command, rawArgv);
      yield command[DISPATCH]();
      return;
    }

    // register command for printing
    for (const [ name, Command ] of this[COMMANDS].entries()) {
      this.yargs.command(name, Command.prototype.description || '');
    }

    debug('[%s] exec run command', this.constructor.name);
    const context = this.context;

    // print completion for bash
    if (context.argv.AUTO_COMPLETIONS) {
      // slice to remove `--AUTO_COMPLETIONS=` which we append
      this.yargs.getCompletion(this.rawArgv.slice(1), completions => {
        // console.log('%s', completions)
        completions.forEach(x => console.log(x));
      });
    } else {
      // handle by self
      yield this.helper.callFn(this.run, [ context ], this);
    }
  }

  /**
   * getter of context, default behavior is remove `help` / `h` / `version`
   * @return {Object} context - { cwd, env, argv, rawArgv }
   * @protected
   */
  get context() {
    const argv = this.yargs.argv;
    const context = {
      argv,
      cwd: process.cwd(),
      env: Object.assign({}, process.env),
      rawArgv: this.rawArgv,
    };

    argv.help = undefined;
    argv.h = undefined;
    argv.version = undefined;
    argv.v = undefined;

    // remove alias result
    if (this.parserOptions.removeAlias) {
      const aliases = this.yargs.getOptions().alias;
      for (const key of Object.keys(aliases)) {
        aliases[key].forEach(item => {
          argv[item] = undefined;
        });
      }
    }

    // remove camel case result
    if (this.parserOptions.removeCamelCase) {
      for (const key of Object.keys(argv)) {
        if (key.includes('-')) {
          argv[changeCase.camel(key)] = undefined;
        }
      }
    }

    // extract execArgv
    if (this.parserOptions.execArgv) {
      // extract from command argv
      let { debugPort, debugOptions, execArgvObj } = this.helper.extractExecArgv(argv);

      // extract from WebStorm env `$NODE_DEBUG_OPTION`
      // Notice: WebStorm 2019 won't export the env, instead, use `env.NODE_OPTIONS="--require="`, but we can't extract it.
      if (context.env.NODE_DEBUG_OPTION) {
        console.log('Use $NODE_DEBUG_OPTION: %s', context.env.NODE_DEBUG_OPTION);
        const argvFromEnv = parser(context.env.NODE_DEBUG_OPTION);
        const obj = this.helper.extractExecArgv(argvFromEnv);
        debugPort = obj.debugPort || debugPort;
        Object.assign(debugOptions, obj.debugOptions);
        Object.assign(execArgvObj, obj.execArgvObj);
      }

      // `--expose_debug_as` is not supported by 7.x+
      if (execArgvObj.expose_debug_as && semver.gte(process.version, '7.0.0')) {
        console.warn(chalk.yellow(`Node.js runtime is ${process.version}, and inspector protocol is not support --expose_debug_as`));
      }

      // remove from origin argv
      for (const key of Object.keys(execArgvObj)) {
        argv[key] = undefined;
        argv[changeCase.camel(key)] = undefined;
      }

      // exports execArgv
      const self = this;
      context.execArgvObj = execArgvObj;

      // convert execArgvObj to execArgv
      // `--require` should be `--require abc --require 123`, not allow `=`
      // `--debug` should be `--debug=9999`, only allow `=`
      Object.defineProperty(context, 'execArgv', {
        get() {
          const lazyExecArgvObj = context.execArgvObj;
          const execArgv = self.helper.unparseArgv(lazyExecArgvObj, { excludes: [ 'require' ] });
          // convert require to execArgv
          let requireArgv = lazyExecArgvObj.require;
          if (requireArgv) {
            if (!Array.isArray(requireArgv)) requireArgv = [ requireArgv ];
            requireArgv.forEach(item => {
              execArgv.push('--require');
              execArgv.push(item.startsWith('./') || item.startsWith('.\\') ? path.resolve(context.cwd, item) : item);
            });
          }
          return execArgv;
        },
      });

      // only exports debugPort when any match
      if (Object.keys(debugOptions).length) {
        context.debugPort = debugPort;
        context.debugOptions = debugOptions;
      }
    }

    return context;
  }

  [PARSE](rawArgv) {
    return new Promise((resolve, reject) => {
      this.yargs.parse(rawArgv, (err, argv) => {
        /* istanbul ignore next */
        if (err) return reject(err);
        resolve(argv);
      });
    });
  }
}

module.exports = CommonBin;
