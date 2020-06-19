'use strict';

const path = require('path');
const bytes = require('humanize-bytes');

module.exports = app => {
  const options = app.config.multipart;
  // make sure to cast the value of config **Size to number
  for (const key in options) {
    if (/^\w+Size$/.test(key)) {
      options[key] = bytes(options[key]);
    }
  }

  let checkExt;
  if (typeof options.whitelist === 'function') {
    checkExt = options.whitelist;
  } else if (Array.isArray(options.whitelist)) {
    options.whitelist = options.whitelist.map(extname => extname.toLowerCase());
    checkExt = filename => options.whitelist.includes(path.extname(filename).toLowerCase());
  } else {
    const fileExtensions = (options.fileExtensions || []).map(extname => {
      return (extname.startsWith('.') || extname === '') ? extname : `.${extname}`;
    });

    // default extname whitelist
    const whitelist = [
      // images
      '.jpg', '.jpeg', // image/jpeg
      '.png', // image/png, image/x-png
      '.gif', // image/gif
      '.bmp', // image/bmp
      '.wbmp', // image/vnd.wap.wbmp
      '.webp',
      '.tif',
      '.psd',
      // text
      '.svg',
      '.js', '.jsx',
      '.json',
      '.css', '.less',
      '.html', '.htm',
      '.xml',
      // tar
      '.zip',
      '.gz', '.tgz', '.gzip',
      // video
      '.mp3',
      '.mp4',
      '.avi',
    ]
      .concat(fileExtensions)
      .map(extname => extname.toLowerCase());

    checkExt = filename => whitelist.includes(path.extname(filename).toLowerCase());
  }

  // https://github.com/mscdex/busboy#busboy-methods
  app.config.multipartParseOptions = {
    autoFields: options.autoFields,
    defCharset: options.defaultCharset,
    limits: {
      fieldNameSize: options.fieldNameSize,
      fieldSize: options.fieldSize,
      fields: options.fields,
      fileSize: options.fileSize,
      files: options.files,
    },
    // check if extname in the whitelist
    checkFile(fieldname, fileStream, filename) {
      // just ignore, if no file
      if (!fileStream || !filename) return null;

      try {
        if (!checkExt(filename)) {
          const err = new Error('Invalid filename: ' + filename);
          err.status = 400;
          return err;
        }
      } catch (err) {
        err.status = 400;
        return err;
      }
    },
  };

  options.mode = options.mode || 'stream';
  if (![ 'stream', 'file' ].includes(options.mode)) {
    throw new TypeError(`Expect mode to be 'stream' or 'file', but got '${options.mode}'`);
  }

  app.coreLogger.info('[egg-multipart] %s mode enable', options.mode);
  if (options.mode === 'file') {
    if (options.fileModeMatch) throw new TypeError('`fileModeMatch` options only work on stream mode, please remove it');
    app.coreLogger.info('[egg-multipart] will save temporary files to %j, cleanup job cron: %j',
      options.tmpdir, options.cleanSchedule.cron);
    // enable multipart middleware
    app.config.coreMiddleware.push('multipart');
  } else if (options.fileModeMatch) {
    app.coreLogger.info('[egg-multipart] will save temporary files to %j, cleanup job cron: %j',
      options.tmpdir, options.cleanSchedule.cron);
    // enable multipart middleware
    app.config.coreMiddleware.push('multipart');
  }
};
