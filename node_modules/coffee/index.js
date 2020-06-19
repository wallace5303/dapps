'use strict';

const Coffee = require('./lib/coffee');
const is = require('is-type-of');
const Rule = require('./lib/rule');

exports.Coffee = Coffee;
exports.Rule = Rule;

/**
 * fork a child process to test
 * @param {String} modulePath - The module to run in the child
 * @param {Array} args - List of string arguments
 * @param {Object} opt - fork options
 * @see https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
 * @return {Coffee} coffee instance
 */
exports.fork = function(modulePath, args, opt) {
  // fork('/path/to/cli', { execArgv: [] })
  if (!opt && !is.array(args)) {
    opt = args;
    args = undefined;
  }
  return new Coffee({
    method: 'fork',
    cmd: modulePath,
    args,
    opt,
  });
};

/**
 * spawn a child process to test
 * @param  {String} cmd - The command to run
 * @param  {Array} args - List of string arguments
 * @param  {Object} opt - spawn options
 * @return {Coffee} coffee instance
 */
exports.spawn = function(cmd, args, opt) {
  // spawn('/path/to/cli', { execArgv: [] })
  if (!opt && !is.array(args)) {
    opt = args;
    args = undefined;
  }
  return new Coffee({
    method: 'spawn',
    cmd,
    args,
    opt,
  });
};
