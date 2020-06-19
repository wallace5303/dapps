declare function mm(target: any, key: string, prop: any): void;

declare namespace mm {
  // export MockMate type for egg-mock;
  type MockMate = typeof mm;

  type Request = (
    url: string | RegExp | { url: string; host: string },
    data: any,
    headers?: object,
    delay?: number
  ) => MockMate;

  type RequestError = (
    url: string | RegExp | { url: string; host: string },
    reqError: string | Error,
    resError: string | Error,
    delay?: number
  ) => MockMate;

  /**
   * Mock async function error.
   */
  function error(mod: any, method: string, error?: string | Error, props?: object, timeout?: number): MockMate;

  /**
   * Mock async function error once.
   */
  function errorOnce(mod: any, method: string, error?: string | Error, props?: object, timeout?: number): MockMate;

  /**
   * mock return callback(null, data).
   */
  function data(mod: any, method: string, data: any, timeout?: number): MockMate;

  /**
   * mock return callback(null, null).
   */
  function empty(mod: any, method: string, timeout?: number): MockMate;

  /**
   * mock return callback(null, data1, data2).
   */
  function datas(mod: any, method: string, datas: any, timeout?: number): MockMate;

  /**
   * mock function sync throw error
   */
  function syncError(mod: any, method: string, error?: string | Error, props?: object): void;

  /**
   * mock function sync return data
   */
  function syncData(mod: any, method: string, data?: any): void;

  /**
   * mock function sync return nothing
   */
  function syncEmpty(mod: any, method: string): void;

  /**
   * remove all mock effects.
   */
  function restore(): MockMate;

  const http: {
    request: Request;
    requestError: RequestError;
  };

  const https: {
    request: Request;
    requestError: RequestError;
  };
}

export = mm;
