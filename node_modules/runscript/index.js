'use strict';

const debug = require('debug')('runscript');
const is = require('is-type-of');
const assert = require('assert');
const path = require('path');
const spawn = require('child_process').spawn;

/**
 * Run shell script in child process
 * Support OSX, Linux and Windows
 * @param {String} script - full script string, like `git clone https://github.com/node-modules/runscript.git`
 * @param {Object} [options] - spawn options
 *   @see https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
 * @param {Object} [extraOptions] - extra options for running
 *   - {Number} [extraOptions.timeout] - child process running timeout
 * @return {Object} stdio object, will contains stdio.stdout and stdio.stderr buffer.
 */
module.exports = function runScript(script, options, extraOptions) {
  return new Promise((resolve, reject) => {
    extraOptions = extraOptions || {};
    options = options || {};
    options.env = options.env || Object.create(process.env);
    options.cwd = options.cwd || process.cwd();
    options.stdio = options.stdio || 'inherit';
    if (options.stdout) assert(is.writableStream(options.stdout), 'options.stdout should be writable stream');
    if (options.stderr) assert(is.writableStream(options.stderr), 'options.stderr should be writable stream');

    let sh = 'sh';
    let shFlag = '-c';

    if (process.platform === 'win32') {
      sh = process.env.comspec || 'cmd';
      shFlag = '/d /s /c';
      options.windowsVerbatimArguments = true;
      if (script.indexOf('./') === 0 || script.indexOf('.\\') === 0 ||
          script.indexOf('../') === 0 || script.indexOf('..\\') === 0) {
        const splits = script.split(' ');
        splits[0] = path.join(options.cwd, splits[0]);
        script = splits.join(' ');
      }
    }

    debug('%s %s %s, %j, %j', sh, shFlag, script, options, extraOptions);
    const proc = spawn(sh, [ shFlag, script ], options);
    const stdout = [];
    const stderr = [];
    let isEnd = false;
    let timeoutTimer;

    if (proc.stdout) {
      proc.stdout.on('data', buf => {
        debug('stdout %d bytes', buf.length);
        stdout.push(buf);
      });
      if (options.stdout) {
        proc.stdout.pipe(options.stdout);
      }
    }
    if (proc.stderr) {
      proc.stderr.on('data', buf => {
        debug('stderr %d bytes', buf.length);
        stderr.push(buf);
      });
      if (options.stderr) {
        proc.stderr.pipe(options.stderr);
      }
    }

    proc.on('error', err => {
      debug('proc emit error: %s', err);
      if (isEnd) return;
      isEnd = true;
      clearTimeout(timeoutTimer);

      reject(err);
    });

    proc.on('close', code => {
      debug('proc emit close: %s', code);
      if (isEnd) return;
      isEnd = true;
      clearTimeout(timeoutTimer);

      const stdio = {
        stdout: null,
        stderr: null,
      };
      if (stdout.length > 0) {
        stdio.stdout = Buffer.concat(stdout);
      }
      if (stderr.length > 0) {
        stdio.stderr = Buffer.concat(stderr);
      }
      if (code !== 0) {
        const err = new Error(`Run "${sh} ${shFlag} ${script}" error, exit code ${code}`);
        err.name = 'RunScriptError';
        err.stdio = stdio;
        err.exitcode = code;
        return reject(err);
      }
      return resolve(stdio);
    });

    proc.on('exit', code => {
      debug('proc emit exit: %s', code);
    });

    if (typeof extraOptions.timeout === 'number' && extraOptions.timeout > 0) {
      // start timer
      timeoutTimer = setTimeout(() => {
        debug('proc run timeout: %dms', extraOptions.timeout);
        isEnd = true;
        debug('kill child process %s', proc.pid);
        proc.kill();

        const err = new Error(`Run "${sh} ${shFlag} ${script}" timeout in ${extraOptions.timeout}ms`);
        err.name = 'RunScriptTimeoutError';
        const stdio = {
          stdout: null,
          stderr: null,
        };
        if (stdout.length > 0) {
          stdio.stdout = Buffer.concat(stdout);
        }
        if (stderr.length > 0) {
          stdio.stderr = Buffer.concat(stderr);
        }
        err.stdio = stdio;
        return reject(err);
      }, extraOptions.timeout);
    }
  });
};
