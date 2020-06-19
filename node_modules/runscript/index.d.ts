import { SpawnOptions } from 'child_process';
import { Writable } from 'stream';

declare namespace RunScript {
  export interface Options extends SpawnOptions {
    stdout?: Writable;
    stderr?: Writable;
  }

  export interface Stdio {
    stdout: Buffer | null;
    stderr: Buffer | null;
  }

  export interface StdError extends Error {
    stdio: Stdio;
  }
}

declare function RunScript(cmd: string, opts?: RunScript.Options): Promise<RunScript.Stdio>;

export = RunScript;
