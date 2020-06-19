import { EventEmitter } from 'events';
import { Server } from 'net';

export interface InterceptorProxyOption {
  port: number;
  silent?: boolean;
}

export interface StartOption {
  debugPort: number;
}

export default class InterceptorProxy extends EventEmitter {
  url: string;
  constructor(options: InterceptorProxyOption);
  start(args: StartOption): Promise<void>;
  end(): Promise<void>;
}