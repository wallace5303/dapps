import { Arguments, Argv } from 'yargs';
import { ForkOptions, SpawnOptions } from 'child_process';
import * as dargs from 'dargs';

interface PlainObject {
  [key: string]: any;
}

// migrating to common-bin later
declare class CommonBin {
  usage: string;
  version: string;

  /**
   * original argument
   * @type {Array}
   */
  rawArgv: string[];

  /**
   * yargs
   * @type {Object}
   */
  yargs: Argv;

  /**
   * helper function
   * @type {Object}
   */
  helper: CommonBin.Helper;

  /**
   * parserOptions
   * @type {Object}
   * @property {Boolean} execArgv - whether extract `execArgv` to `context.execArgv`
   * @property {Boolean} removeAlias - whether remove alias key from `argv`
   * @property {Boolean} removeCamelCase - whether remove camel case key from `argv`
   */
  parserOptions: {
    execArgv: boolean;
    removeAlias: boolean;
    removeCamelCase: boolean;
  };

  /**
   * getter of context, default behavior is remove `help` / `h` / `version`
   * @return {Object} context - { cwd, env, argv, rawArgv }
   * @protected
   */
  protected context: CommonBin.Context;

  constructor(rawArgv?: string[]);

  /**
   * command handler, could be generator / async function / normal function which return promise
   * @param {Object} context - context object
   * @param {String} context.cwd - process.cwd()
   * @param {Object} context.argv - argv parse result by yargs, `{ _: [ 'start' ], '$0': '/usr/local/bin/common-bin', baseDir: 'simple'}`
   * @param {Array} context.rawArgv - the raw argv, `[ "--baseDir=simple" ]`
   * @protected
   */
  protected run(context?: CommonBin.Context): any;

  /**
   * load sub commands
   * @param {String} fullPath - the command directory
   * @example `load(path.join(__dirname, 'command'))`
   */
  load(fullPath: string): void;

  /**
   * add sub command
   * @param {String} name - a command name
   * @param {String|Class} target - special file path (must contains ext) or Command Class
   * @example `add('test', path.join(__dirname, 'test_command.js'))`
   */
  add(name: string, target: string | CommonBin): void;

  /**
   * alias an existing command
   * @param {String} alias - alias command
   * @param {String} name - exist command
   */
  alias(alias: string, name: string): void;

  /**
   * start point of bin process
   */
  start(): void;

  /**
   * default error hander
   * @param {Error} err - error object
   * @protected
   */
  protected errorHandler(err: Error): void;

  /**
   * print help message to console
   * @param {String} [level=log] - console level
   */
  showHelp(level?: string): void;
}

declare namespace CommonBin {
  export interface Helper {
    /**
     * fork child process, wrap with promise and gracefull exit
     * @method helper#forkNode
     * @param {String} modulePath - bin path
     * @param {Array} [args] - arguments
     * @param {Object} [options] - options
     * @return {Promise} err or undefined
     * @see https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
     */
    forkNode(modulePath: string, args?: string[], options?: ForkOptions): Promise<void>;

    /**
     * spawn a new process, wrap with promise and gracefull exit
     * @method helper#forkNode
     * @param {String} cmd - command
     * @param {Array} [args] - arguments
     * @param {Object} [options] - options
     * @return {Promise} err or undefined
     * @see https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
     */
    spawn(cmd: string, args?: string[], options?: SpawnOptions): Promise<void>;

    /**
     * exec npm install
     * @method helper#npmInstall
     * @param {String} npmCli - npm cli, such as `npm` / `cnpm` / `npminstall`
     * @param {String} name - node module name
     * @param {String} cwd - target directory
     * @return {Promise} err or undefined
     */
    npmInstall(npmCli: string, name: string, cwd?: string): Promise<void>;

    /**
     * call fn
     * @method helper#callFn
     * @param {Function} fn - support generator / async / normal function return promise
     * @param {Array} [args] - fn args
     * @param {Object} [thisArg] - this
     * @return {Object} result
     */
    callFn<T = any, U extends any[] = any[]>(fn: (...args: U) => IterableIterator<T> | Promise<T> | T, args?: U, thisArg?: any): IterableIterator<T>;

    /**
     * unparse argv and change it to array style
     * @method helper#unparseArgv
     * @param {Object} argv - yargs style
     * @param {Object} [options] - options, see more at https://github.com/sindresorhus/dargs
     * @param {Array} [options.includes] - keys or regex of keys to include
     * @param {Array} [options.excludes] - keys or regex of keys to exclude
     * @return {Array} [ '--debug=7000', '--debug-brk' ]
     */
    unparseArgv(argv: object, options?: dargs.Options): string[];

    /**
     * extract execArgv from argv
     * @method helper#extractExecArgv
     * @param {Object} argv - yargs style
     * @return {Object} { debugPort, debugOptions: {}, execArgvObj: {} }
     */
    extractExecArgv(argv: object): { debugPort?: number; debugOptions?: PlainObject; execArgvObj: PlainObject };
  }

  export interface Context extends PlainObject {
    cwd: string;
    rawArgv: string[];
    env: PlainObject;
    argv: Arguments<PlainObject>;
    execArgvObj: PlainObject;
    readonly execArgv: string[];
    debugPort?: number;
    debugOptions?: PlainObject;
  }
}

export = CommonBin;
