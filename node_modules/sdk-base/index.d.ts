// Type definitions for sdk-base 3.4
// Project: https://github.com/node-modules/sdk-base
// Definitions by: Sang Lv <https://github.com/sang4lv>
// TypeScript Version: 2.9.2

/* =================== USAGE ===================
    import Base from "sdk-base";
    class newSDK extends Base {}
 =============================================== */

/// <reference types="node" />

import { EventEmitter } from 'events';

interface BaseOptions {
    initMethod?: string;
    [key: string]: any;
}

export default class Base extends EventEmitter {
    constructor(option?: BaseOptions);

    isReady: boolean;
    options: BaseOptions;
    await(...args: any[]): Promise<any>;
    awaitFirst(...args: any[]): Promise<any>;
    
    ready(): Promise<any>;
    ready(err: Error): void;
    ready(ready: boolean): void;
    ready(readyCallback: Function): void;
}
