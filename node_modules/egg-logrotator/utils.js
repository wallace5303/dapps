'use strict';

function walkLoggerFile(loggers) {
  const files = [];
  for (const key in loggers) {
    if (!loggers.hasOwnProperty(key)) {
      continue;
    }
    const registeredLogger = loggers[key];
    for (const transport of registeredLogger.values()) {
      const file = transport.options.file;
      if (file) {
        files.push(file);
      }
    }
  }
  return files;
}

exports.walkLoggerFile = walkLoggerFile;
