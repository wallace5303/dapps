import 'egg';
import { Readable } from 'stream';
interface EggFile {
  field: string;
  filename: string;
  encoding: string;
  mime: string;
  filepath: string;
}

interface MultipartOptions {
  requireFile?: boolean; // required file submit, default is true
  defCharset?: string;
  limits?: {
    fieldNameSize?: number;
    fieldSize?: number;
    fields?: number;
    fileSize?: number;
    files?: number;
    parts?: number;
    headerPairs?: number;
  };
  checkFile?(
    fieldname: string,
    file: any,
    filename: string,
    encoding: string,
    mimetype: string
  ): void | Error;
}

interface MultipartFileStream extends Readable {
  fields: any;
  filename: string;
  fieldname: string;
  mime: string;
  mimeType: string;
  transferEncoding: string;
  encoding: string;
  truncated: boolean;
}

interface ScheduleOptions {
  type?: string;
  cron?: string;
  cronOptions?: {
    tz?: string;
    utc?: boolean;
    iterator?: boolean;
    currentDate?: string|number|Date;
    endDate?: string|number|Date;
  };
  interval?: number|string;
  immediate?: boolean;
  disable?: boolean;
  env?: string[];
}

declare module 'egg' {
  interface Context {
    /**
     * clean up request tmp files helper
     * @param {EggFile[]} files file paths need to clenup, default is `ctx.request.files`.
     * @return {Promise<void>}
     */
    cleanupRequestFiles(files?: EggFile[]): Promise<void>;

    /**
     * save request multipart data and files to `ctx.request`
     * @return {Promise<void>}
     */
    saveRequestFiles(): Promise<void>;

    /**
     * create multipart.parts instance, to get separated files.
     * @param {MultipartOptions} options
     * @return {Function} return a function which return a Promise
     */
    multipart(options?: MultipartOptions): (fn?: Function) => Promise<any>;

    /**
     * get upload file stream
     * @param {MultipartOptions} options
     * @return {Promise<MultipartFileStream>}
     */
    getFileStream(options?: MultipartOptions): Promise<MultipartFileStream>
  }

  interface Request {
    /**
     * Files Object Array
     */
    files: EggFile[];
  }

  type MatchItem = string | RegExp | ((ctx: Context) => boolean);

  interface EggAppConfig {
    multipart: {
      mode?: string;
      fileModeMatch?: MatchItem | MatchItem[];
      autoFields?: boolean;
      defaultCharset?: string;
      fieldNameSize?: number;
      fieldSize?: string|number;
      fields?: number;
      fileSize?: string|number;
      files?: number;
      whitelist?: ((filename: string) => boolean)|string[];
      fileExtensions?: string[];
      tmpdir?: string;
      cleanSchedule?: ScheduleOptions;
    }
  }
}
