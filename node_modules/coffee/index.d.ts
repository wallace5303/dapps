import { EventEmitter } from 'events';
import { ForkOptions, SpawnOptions, ChildProcess } from 'child_process';
import { Readable } from 'stream';

export interface RuleOpt {
  ctx: any;
  type: string;
  expected: ExpectedType | ExpectedType[];
  args?: string[];
  isOpposite?: boolean;
}

export class Rule {
  constructor(opt: RuleOpt);
  validate(message?: string): void;
  assert(actual: any, expected: any, message?: string | Error): void;
  formatMessage(actual: any, expected: any, message?: string | Error): string;
  inspectObj(obj: any): string;
}

export interface Result {
  stdout: string;
  stderr: string;
  code: number;
  error: Error | null;
  proc: ChildProcess | null;
}

export interface CoffeeOpt<T> {
  method: string;
  cmd: string;
  args?: string[];
  opt?: T;
}

export type ExpectedType = number | string | RegExp;

export class Coffee<T = any> extends EventEmitter {
  method: string;
  cmd: string;
  args?: string[];
  opt?: T;
  constructor(opt: CoffeeOpt<T>);
  debug(level?: number | boolean): this;

  /**
   * Assert type with expected value
   *
   * @param {String} type - assertion rule type, can be `code`,`stdout`,`stderr`,`error`.
   * @param {Array} args - spread args, the first item used to be a test value `{Number|String|RegExp|Array} expected`
   * @return {Coffee} return self for chain
   */
  expect(type: string, ...args: Array<ExpectedType | ExpectedType[]>): this;

   /**
   * Assert type with not expected value, opposite assertion of `expect`.
   *
   * @param {String} type - assertion rule type, can be `code`,`stdout`,`stderr`,`error`.
   * @param {Array} args - spread args, the first item used to be a test value `{Number|String|RegExp|Array} expected`
   * @return {Coffee} return self for chain
   */
  notExpect(type: string, ...args: Array<ExpectedType | ExpectedType[]>): this;

  /**
   * allow user to custom rule
   * @param {String} type - rule type
   * @param {Rule} RuleClz - custom rule class
   * @protected
   */
  setRule(type: string, RuleClz: typeof Rule);

  /**
   * Write data to stdin of the command
   * @param {String} input - input text
   * @return {Coffee} return self for chain
   */
  write(input: string): this;

  /**
   * Write special key sequence to stdin of the command, if key name not found then write origin key.
   * @example `.writeKey('2', 'ENTER', '3')`
   * @param {...String} args - input key names, will join as one key
   * @return {Coffee} return self for chain
   */
  writeKey(...args: string[]): this;

  /**
   * whether set as prompt mode
   *
   * mark as `prompt`, all stdin call by `write` will wait for `prompt` event then output
   * @param {Boolean} [enable] - default to true
   * @return {Coffee} return self for chain
   */
  waitForPrompt(enable?: boolean): this;

  /**
   * get `end` hook
   *
   * @param {Function} [cb] - callback, recommended to left undefind and use promise
   */
  end(cb: (e: Error | undefined, result: Result) => any): void;

  /**
   * get `end` hook
   *
   * @return {Promise} - end promise
   */
  end(): Promise<Result>;

   /**
   * inject script file for mock purpose
   *
   * @param {String} scriptFile - script file full path
   * @return {Coffee} return self for chain
   */
  beforeScript(scriptFile: string): this;
  restore(): this;
}

/**
 * fork a child process to test
 * @param {String} modulePath - The module to run in the child
 * @param {Array} args - List of string arguments
 * @param {Object} opt - fork options
 * @see https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
 * @return {Coffee} coffee instance
 */
export function fork(modulePath: string, args?: string[], opt?: ForkOptions): Coffee<ForkOptions>;

/**
 * fork a child process to test
 * @param {String} modulePath - The module to run in the child
 * @param {Object} opt - fork options
 * @see https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
 * @return {Coffee} coffee instance
 */
export function fork(modulePath: string, opt?: ForkOptions): Coffee<ForkOptions>;

/**
 * spawn a child process to test
 * @param  {String} cmd - The command to run
 * @param  {Array} args - List of string arguments
 * @param  {Object} opt - spawn options
 * @return {Coffee} coffee instance
 */
export function spawn(modulePath: string, args?: string[], opt?: SpawnOptions): Coffee<SpawnOptions>;

/**
 * spawn a child process to test
 * @param  {String} cmd - The command to run
 * @param  {Object} opt - spawn options
 * @return {Coffee} coffee instance
 */
export function spawn(modulePath: string, opt?: SpawnOptions): Coffee<SpawnOptions>;
