'use strict';

const os = require('os');
const path = require('path');

module.exports = appInfo => {
  const config = {};

  /**
   * multipart parser options
   * @member Config#multipart
   * @property {String} mode - which mode to handle multipart request, default is `stream`, the hard way.
   *   If set mode to `file`, it's the easy way to handle multipart request and save it to local files.
   *   If you don't know the Node.js Stream work, maybe you should use the `file` mode to get started.
   * @property {String | RegExp | Function | Array} fileModeMatch - special url to use file mode when global `mode` is `stream`.
   * @property {Boolean} autoFields - Auto set fields to parts, default is `false`. Only work on `stream` mode.
   *   If set true，all fields will be auto handle and can acces by `parts.fields`
   * @property {String} defaultCharset - Default charset encoding, don't change it before you real know about it
   * @property {Integer} fieldNameSize - Max field name size (in bytes), default is `100`
   * @property {String|Integer} fieldSize - Max field value size (in bytes), default is `100kb`
   * @property {Integer} fields - Max number of non-file fields, default is `10`
   * @property {String|Integer} fileSize - Max file size (in bytes), default is `10mb`
   * @property {Integer} files - Max number of file fields, default is `10`
   * @property {Array|Function} whitelist - The white ext file names, default is `null`
   * @property {Array} fileExtensions - Add more ext file names to the `whitelist`, default is `[]`
   * @property {String} tmpdir - The directory for temporary files. Only work on `file` mode.
   */
  config.multipart = {
    mode: 'stream',
    autoFields: false,
    defaultCharset: 'utf8',
    fieldNameSize: 100,
    fieldSize: '100kb',
    fields: 10,
    fileSize: '10mb',
    files: 10,
    fileExtensions: [],
    whitelist: null,
    tmpdir: path.join(os.tmpdir(), 'egg-multipart-tmp', appInfo.name),
    cleanSchedule: {
      // run tmpdir clean job on every day 04:30 am
      // cron style see https://github.com/eggjs/egg-schedule#cron-style-scheduling
      cron: '0 30 4 * * *',
    },
  };

  return config;
};
