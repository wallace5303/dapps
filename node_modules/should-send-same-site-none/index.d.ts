declare module 'should-send-same-site-none' {
  import { RequestHandler } from 'express';

  export const shouldSendSameSiteNone: RequestHandler;
  export function isSameSiteNoneCompatible(useragent: string): boolean;
}