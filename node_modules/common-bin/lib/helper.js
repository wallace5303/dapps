'use strict';

const debug = require('debug')('common-bin');
const cp = require('child_process');
const is = require('is-type-of');
const unparse = require('dargs');

// only hook once and only when ever start any child.
const childs = new Set();
let hadHook = false;
function gracefull(proc) {
  // save child ref
  childs.add(proc);

  // only hook once
  /* istanbul ignore else */
  if (!hadHook) {
    hadHook = true;
    let signal;
    [ 'SIGINT', 'SIGQUIT', 'SIGTERM' ].forEach(event => {
      process.once(event, () => {
        signal = event;
        process.exit(0);
      });
    });

    process.once('exit', () => {
      // had test at my-helper.test.js, but coffee can't collect coverage info.
      for (const child of childs) {
        debug('kill child %s with %s', child.pid, signal);
        child.kill(signal);
      }
    });
  }
}

/**
 * fork child process, wrap with promise and gracefull exit
 * @function helper#forkNode
 * @param {String} modulePath - bin path
 * @param {Array} [args] - arguments
 * @param {Object} [options] - options
 * @return {Promise} err or undefined
 * @see https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
 */
exports.forkNode = (modulePath, args = [], options = {}) => {
  options.stdio = options.stdio || 'inherit';
  debug('Run fork `%s %s %s`', process.execPath, modulePath, args.join(' '));
  const proc = cp.fork(modulePath, args, options);
  gracefull(proc);

  return new Promise((resolve, reject) => {
    proc.once('exit', code => {
      childs.delete(proc);
      if (code !== 0) {
        const err = new Error(modulePath + ' ' + args + ' exit with code ' + code);
        err.code = code;
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * spawn a new process, wrap with promise and gracefull exit
 * @function helper#forkNode
 * @param {String} cmd - command
 * @param {Array} [args] - arguments
 * @param {Object} [options] - options
 * @return {Promise} err or undefined
 * @see https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
 */
exports.spawn = (cmd, args = [], options = {}) => {
  options.stdio = options.stdio || 'inherit';
  debug('Run spawn `%s %s`', cmd, args.join(' '));

  return new Promise((resolve, reject) => {
    const proc = cp.spawn(cmd, args, options);
    gracefull(proc);
    proc.once('error', err => {
      /* istanbul ignore next */
      reject(err);
    });
    proc.once('exit', code => {
      childs.delete(proc);

      if (code !== 0) {
        return reject(new Error(`spawn ${cmd} ${args.join(' ')} fail, exit code: ${code}`));
      }
      resolve();
    });
  });
};

/**
 * exec npm install
 * @function helper#npmInstall
 * @param {String} npmCli - npm cli, such as `npm` / `cnpm` / `npminstall`
 * @param {String} name - node module name
 * @param {String} cwd - target directory
 * @return {Promise} err or undefined
 */
exports.npmInstall = (npmCli, name, cwd) => {
  const options = {
    stdio: 'inherit',
    env: process.env,
    cwd,
  };

  const args = [ 'i', name ];
  console.log('[common-bin] `%s %s` to %s ...', npmCli, args.join(' '), options.cwd);

  return exports.spawn(npmCli, args, options);
};

/**
 * call fn
 * @function helper#callFn
 * @param {Function} fn - support generator / async / normal function return promise
 * @param {Array} [args] - fn args
 * @param {Object} [thisArg] - this
 * @return {Object} result
 */
exports.callFn = function* (fn, args = [], thisArg) {
  if (!is.function(fn)) return;
  if (is.generatorFunction(fn)) {
    return yield fn.apply(thisArg, args);
  }
  const r = fn.apply(thisArg, args);
  if (is.promise(r)) {
    return yield r;
  }
  return r;
};

/**
 * unparse argv and change it to array style
 * @function helper#unparseArgv
 * @param {Object} argv - yargs style
 * @param {Object} [options] - options, see more at https://github.com/sindresorhus/dargs
 * @param {Array} [options.includes] - keys or regex of keys to include
 * @param {Array} [options.excludes] - keys or regex of keys to exclude
 * @return {Array} [ '--debug=7000', '--debug-brk' ]
 */
exports.unparseArgv = (argv, options = {}) => {
  // revert argv object to array
  // yargs will paser `debug-brk` to `debug-brk` and `debugBrk`, so we need to filter
  return [ ...new Set(unparse(argv, options)) ];
};

/**
 * extract execArgv from argv
 * @function helper#extractExecArgv
 * @param {Object} argv - yargs style
 * @return {Object} { debugPort, debugOptions: {}, execArgvObj: {} }
 */
exports.extractExecArgv = argv => {
  const debugOptions = {};
  const execArgvObj = {};
  let debugPort;

  for (const key of Object.keys(argv)) {
    const value = argv[key];
    // skip undefined set uppon (camel etc.)
    if (value === undefined) continue;
    // debug / debug-brk / debug-port / inspect / inspect-brk / inspect-port
    if ([ 'debug', 'debug-brk', 'debug-port', 'inspect', 'inspect-brk', 'inspect-port' ].includes(key)) {
      if (typeof value === 'number') debugPort = value;
      debugOptions[key] = argv[key];
      execArgvObj[key] = argv[key];
    } else if (match(key, [ 'es_staging', 'expose_debug_as', /^harmony.*/ ])) {
      execArgvObj[key] = argv[key];
    } else if (key.startsWith('node-options--')) {
      // support node options, like: commond --node-options--trace-warnings => execArgv.push('--trace-warnings')
      execArgvObj[key.replace('node-options--', '')] = argv[key];
    }
  }
  return { debugPort, debugOptions, execArgvObj };
};

function match(key, arr) {
  return arr.some(x => x instanceof RegExp ? x.test(key) : x === key); // eslint-disable-line no-confusing-arrow
}
