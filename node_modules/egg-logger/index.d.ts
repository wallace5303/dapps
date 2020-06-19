interface ILoggerLevel {
  ALL: number;
  DEBUG: number;
  INFO: number;
  WARN: number;
  ERROR: number;
  NONE: number;
}

export const levels: ILoggerLevel;
export type LoggerLevel = keyof ILoggerLevel;

export interface LoggerOptions {
  level?: LoggerLevel;
  encoding?: string;
  consoleLevel?: LoggerLevel;
  allowDebugAtProd?: boolean;
}

export interface EggLoggerOptions extends LoggerOptions {
  file: string;
  formatter?: (meta?: object) => string;
  contextFormatter?: (meta?: object) => string;
  jsonFile?: string;
  outputJSON?: boolean;
  buffer?: boolean;
  eol?: string;
  concentrateError?: 'duplicate' | 'redirect' | 'ignore';
}

export class Logger<T extends LoggerOptions = LoggerOptions> extends Map<string, Transport> {
  constructor(options: T);

  /**
   * disable a transport
   * @param {String} name - transport name
   */
  disable(name: string): void;

  /**
   * enable a transport
   * @param {String} name - transport name
   */
  enable(name: string): void;

  /**
   * Send log to all transports.
   * It's proxy to {@link Transport}'s log method.'
   * @param {String} level - log level
   * @param {Array} args - log arguments
   * @param {Object} meta - log meta
   */
  log(level: LoggerLevel, args: any[], meta: object): void;

  /**
   * write raw log to all transports
   * @param {String} msg - log message
   */
  write(msg: string): void;

  /**
   * Redirect specify level log to the other logger
   * @param {String} level - log level
   * @param {Logger} logger - target logger instance
   */
  redirect(level: LoggerLevel, logger: Logger): void;

  /**
   * Un-redirect specify level log
   * @param {String} level - log level
   */
  unredirect(level: LoggerLevel): void;

  /**
   * Duplicate specify level log to the other logger
   * @param {String} level - log level
   * @param {Logger} logger - target logger instance
   * @param {Object} [options] - { excludes: [] }
   */
  duplicate(level: LoggerLevel, logger: Logger, options?: { excludes?: string[] }): void;

  /**
   * Un-duplicate specify level log
   * @param {String} level - log level
   */
  unduplicate(level: LoggerLevel): void;

  /**
   * Reload all transports
   */
  reload(): void;

  /**
   * End all transports
   */
  close(): void;

  error(msg: any, ...args: any[]): void;
  warn(msg: any, ...args: any[]): void;
  info(msg: any, ...args: any[]): void;
  debug(msg: any, ...args: any[]): void;
}

export class EggLogger extends Logger<EggLoggerOptions> {
  level: LoggerLevel;
  consoleLevel: LoggerLevel;
}

export class EggErrorLogger extends Logger {}
export class EggConsoleLogger extends Logger {}
export class EggCustomLogger extends Logger {}

export class EggContextLogger {
  constructor(ctx: any, logger: Logger);
  readonly paddingMessage: string;
  write(msg: string): void;
  error(msg: any, ...args: any[]): void;
  warn(msg: any, ...args: any[]): void;
  info(msg: any, ...args: any[]): void;
  debug(msg: any, ...args: any[]): void;
}

export interface EggLoggersOptions {
  env?: string;
  type: string;
  dir: string;
  encoding?: string;
  level?: LoggerLevel;
  consoleLevel?: LoggerLevel;
  outputJSON?: boolean;
  buffer?: boolean;
  appLogName: string;
  coreLogName: string;
  agentLogName: string;
  errorLogName: string;
  eol?: string;
  // whether write error logger to common-error.log, `duplicate` / `redirect` / `ignore`, default to `duplicate`
  concentrateError?: 'duplicate' | 'redirect' | 'ignore';
}

export class EggLoggers extends Map<string, Logger> {
  constructor(options: EggLoggersOptions);

  /**
   * Disable console logger
   */
  disableConsole(): void;

  /**
   * reload all logger
   */
  reload(): void;

  /**
   * Add a logger
   * @param {String} name - logger name
   * @param {Logger} logger - Logger instance
   */
  set(name: string, logger: Logger): this;

  [key: string]: any;
}

export interface TransportOptions {
  level?: LoggerLevel;
  formatter?: (meta?: object) => string;
  contextFormatter?: (meta?: object) => string;
  json?: boolean;
  encoding?: string;
  eol?: string;
}

export interface FileTransportOptions extends TransportOptions {
  file: string;
}

export interface FileBufferTransportOptions extends FileTransportOptions {
  flushInterval?: number;
  maxBufferLength?: number;
}

export interface ConsoleTransportOptions extends TransportOptions {
  stderrLevel?: string;
}

export class Transport<T extends TransportOptions = TransportOptions> {
  constructor(options?: T);
  readonly enabled: boolean;
  level: LoggerLevel;
  enable(): void;
  shouldLog(level: LoggerLevel): boolean;
  log(level: LoggerLevel, args: any[], meta: object): void;
  reload(): void;
  close(): void;
  end(): void;
}
export class FileTransport extends Transport<FileTransportOptions> {}
export class FileBufferTransport extends Transport<FileBufferTransportOptions> {
  flush(): void;
}
export class ConsoleTransport extends Transport<ConsoleTransportOptions> {}
