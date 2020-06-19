'use strict';

/**
 * logrotator options
 * @member Config#logrotator
 * @property {Array} filesRotateByHour - list of files that will be rotated by hour
 * @property {Array} filesRotateBySize - list of files that will be rotated by size
 * @property {Number} maxFileSize - Max file size to judge if any file need rotate
 * @property {Number} maxFiles - pieces rotate by size
 * @property {Number} maxDays - keep max days log files, default is `31`. Set `0` to keep all logs.
 * @property {Number} rotateDuration - time interval to judge if any file need rotate
 * @property {Number} maxDays - keep max days log files
 */
exports.logrotator = {
  // for rotate_by_hour
  filesRotateByHour: null,
  hourDelimiter: '-',
  // for rotate_by_size
  filesRotateBySize: null,
  maxFileSize: 50 * 1024 * 1024,
  maxFiles: 10,
  rotateDuration: 60000,
  // for clean_log
  maxDays: 31,
};
