'use strict';

const path = require('path');
const fs = require('fs');
const EventEmitter = require('events');
const cp = require('child_process');
const assert = require('assert');
const debug = require('debug')('coffee');
const spawn = require('cross-spawn');
const show = require('./show');
const Rule = require('./rule');
const ErrorRule = require('./rule_error');

const KEYS = {
  UP: '\u001b[A',
  DOWN: '\u001b[B',
  LEFT: '\u001b[D',
  RIGHT: '\u001b[C',
  ENTER: '\n',
  SPACE: ' ',
};

class Coffee extends EventEmitter {

  constructor(options = {}) {
    super();
    const { method, cmd, args, opt = {} } = options;

    assert(method && cmd, 'should specify method and cmd');
    assert(!opt.cwd || fs.existsSync(opt.cwd), `opt.cwd(${opt.cwd}) not exists`);

    this.method = method;
    this.cmd = cmd;
    this.args = args;
    this.opt = opt;

    // Only accept these type below for assertion
    this.RuleMapping = {
      stdout: Rule,
      stderr: Rule,
      code: Rule,
      error: ErrorRule,
    };

    this.restore();

    this._hookEvent();

    if (process.env.COFFEE_DEBUG) {
      this.debug(process.env.COFFEE_DEBUG);
    }

    process.nextTick(this._run.bind(this));
  }

  _hookEvent() {
    this.on('stdout_data', buf => {
      debug('output stdout `%s`', show(buf));
      this._debug_stdout && process.stdout.write(buf);
      this.stdout += buf;
      this.emit('stdout', buf.toString(), this);
    });
    this.on('stderr_data', buf => {
      debug('output stderr `%s`', show(buf));
      this._debug_stderr && process.stderr.write(buf);
      this.stderr += buf;
      this.emit('stderr', buf.toString(), this);
    });
    this.on('error', err => {
      this.error = err;
    });
    this.once('close', code => {
      debug('output code `%s`', show(code));
      this.code = code;
      this.complete = true;
      try {
        for (const rule of this._waitAssert) {
          rule.validate();
        }
        // suc
        const result = {
          stdout: this.stdout,
          stderr: this.stderr,
          code: this.code,
          error: this.error,
          proc: this.proc,
        };
        this.emit('complete_success', result);
        this.cb && this.cb(undefined, result);
      } catch (err) {
        err.proc = this.proc;
        this.emit('complete_error', err);
        return this.cb && this.cb(err);
      }
    });
  }

  coverage() {
    // it has not been impelmented
    // if (enable === false) {
    //   process.env.NYC_NO_INSTRUMENT = true;
    // }
    return this;
  }

  debug(level) {
    this._debug_stderr = false;

    // 0 (default) -> stdout + stderr
    // 1 -> stdout
    // 2 -> stderr
    switch (String(level)) {
      case '1':
        this._debug_stdout = true;
        break;
      case '2':
        this._debug_stderr = true;
        break;
      case 'false':
        this._debug_stdout = false;
        this._debug_stderr = false;
        break;
      default:
        this._debug_stdout = true;
        this._debug_stderr = true;
    }

    return this;
  }

  /**
   * Assert type with expected value
   *
   * @param {String} type - assertion rule type, can be `code`,`stdout`,`stderr`,`error`.
   * @param {Array} args - spread args, the first item used to be a test value `{Number|String|RegExp|Array} expected`
   * @return {Coffee} return self for chain
   */
  expect(type, ...args) {
    this._addAssertion({
      type,
      args,
    });
    return this;
  }

  /**
   * Assert type with not expected value, opposite assertion of `expect`.
   *
   * @param {String} type - assertion rule type, can be `code`,`stdout`,`stderr`,`error`.
   * @param {Array} args - spread args, the first item used to be a test value `{Number|String|RegExp|Array} expected`
   * @return {Coffee} return self for chain
   */
  notExpect(type, ...args) {
    this._addAssertion({
      type,
      args,
      isOpposite: true,
    });
    return this;
  }

  _addAssertion({ type, args, isOpposite }) {
    const RuleClz = this.RuleMapping[type];
    assert(RuleClz, `unknown rule type: ${type}`);

    const rule = new RuleClz({
      ctx: this,
      type,
      expected: args[0],
      args,
      isOpposite,
    });

    if (this.complete) {
      rule.validate();
    } else {
      this._waitAssert.push(rule);
    }
  }

  /**
   * allow user to custom rule
   * @param {String} type - rule type
   * @param {Rule} RuleClz - custom rule class
   * @protected
   */
  setRule(type, RuleClz) {
    this.RuleMapping[type] = RuleClz;
  }

  /**
   * Write data to stdin of the command
   * @param {String} input - input text
   * @return {Coffee} return self for chain
   */
  write(input) {
    assert(!this._isEndCalled, 'can\'t call write after end');
    this.stdin.push(input);
    return this;
  }

  /**
   * Write special key sequence to stdin of the command, if key name not found then write origin key.
   * @example `.writeKey('2', 'ENTER', '3')`
   * @param {...String} args - input key names, will join as one key
   * @return {Coffee} return self for chain
   */
  writeKey(...args) {
    const input = args.map(x => KEYS[x] || x);
    return this.write(input.join(''));
  }

  /**
   * whether set as prompt mode
   *
   * mark as `prompt`, all stdin call by `write` will wait for `prompt` event then output
   * @param {Boolean} [enable] - default to true
   * @return {Coffee} return self for chain
   */
  waitForPrompt(enable) {
    this._isWaitForPrompt = enable !== false;
    return this;
  }

  /**
   * get `end` hook
   *
   * @param {Function} [cb] - callback, recommended to left undefind and use promise
   * @return {Promise} - end promise
   */
  end(cb) {
    this.cb = cb;
    if (!cb) {
      return new Promise((resolve, reject) => {
        this.on('complete_success', resolve);
        this.on('complete_error', reject);
      });
    }
  }

  /**
   * inject script file for mock purpose
   *
   * @param {String} scriptFile - script file full path
   * @return {Coffee} return self for chain
   */
  beforeScript(scriptFile) {
    assert(this.method === 'fork', `can't set beforeScript on ${this.method} process`);
    assert(path.isAbsolute(this.cmd), `can't set beforeScript, ${this.cmd} must be absolute path`);
    this._beforeScriptFile = scriptFile;

    return this;
  }

  _run() {
    this._isEndCalled = true;

    if (this._beforeScriptFile) {
      const execArgv = this.opt.execArgv ? this.opt.execArgv : [].concat(process.execArgv);
      execArgv.push('-r', this._beforeScriptFile);
      this.opt.execArgv = execArgv;
    }

    const cmd = this.proc = run(this.method, this.cmd, this.args, this.opt);

    cmd.stdout && cmd.stdout.on('data', this.emit.bind(this, 'stdout_data'));
    cmd.stderr && cmd.stderr.on('data', this.emit.bind(this, 'stderr_data'));
    cmd.once('error', this.emit.bind(this, 'error'));
    cmd.once('close', this.emit.bind(this, 'close'));

    process.once('exit', code => {
      debug(`coffee exit with ${code}`);
      cmd.exitCode = code;
      cmd.kill();
    });

    if (this.stdin.length) {
      if (this._isWaitForPrompt) {
        // wait for message then write to stdin
        cmd.on('message', msg => {
          if (msg.type !== 'prompt' || this.stdin.length === 0) return;
          const buf = this.stdin.shift();
          debug('prompt stdin `%s`', show(buf));
          cmd.stdin.write(buf);
          if (this.stdin.length === 0) cmd.stdin.end();
        });
      } else {
        // write immediately
        this.stdin.forEach(function(buf) {
          debug('input stdin `%s`', show(buf));
          cmd.stdin.write(buf);
        });
        cmd.stdin.end();
      }
    }

    return this;
  }

  restore() {
    // cache input for command
    this.stdin = [];

    // cache output for command
    this.stdout = '';
    this.stderr = '';
    this.code = null;
    this.error = null;

    // cache expected output
    this._waitAssert = [];
    this.complete = false;
    this._isEndCalled = false;
    this._isWaitForPrompt = false;
    this._debug_stdout = false;
    this._debug_stderr = false;
    this._isCoverage = true;
    return this;
  }
}

module.exports = Coffee;

function run(method, cmd, args, opt) {
  if (!opt && args && typeof args === 'object' && !Array.isArray(args)) {
    // run(method, cmd, opt)
    opt = args;
    args = null;
  }

  args = args || [];
  opt = opt || {};

  // Force pipe to parent
  if (method === 'fork') {
    // Boolean If true, stdin, stdout, and stderr of the child will be piped to the parent,
    // otherwise they will be inherited from the parent
    opt.silent = true;
  }

  debug('child_process.%s("%s", [%s], %j)', method, cmd, args, opt);
  let handler = cp[method];
  /* istanbul ignore next */
  if (process.platform === 'win32' && method === 'spawn') handler = spawn;
  return handler(cmd, args, opt);
}
