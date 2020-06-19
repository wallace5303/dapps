'use strict';

const fs = require('fs');
const path = require('path');
const crequire = require('crequire');
const debug = require('debug')('resolve-files');

const defaults = {
  cwd: process.cwd(),
  entry: [],
  ignoreModules: false,
};

module.exports = options => {
  options = Object.assign({}, defaults, options);

  const entries = new Set(options.entry || []);

  try {
    entries.add(require.resolve(options.cwd));
  } catch (err) {
    debug('require %s error: %s', options.cwd, err.message);
  }

  if (!entries.size) return [];

  const files = new Set();
  for (const entry of entries) {
    if (fs.existsSync(entry) && fs.statSync(entry).isFile()) {
      resolveFile(entry, files, options);
    }
  }

  return Array.from(files);
};


function resolveFile(entry, files, options) {
  if (files.has(entry)) return;
  files.add(entry);
  debug('resolve entry %s', entry);
  const body = fs.readFileSync(entry, 'utf8');
  const rfiles = crequire(body, true).map(o => o.path);
  for (let file of rfiles) {
    // only resolve relative path
    if (file[0] === '.') {
      // ./foo.js > foo.js
      file = path.join(path.dirname(entry), file);
      if (isFile(file)) {
        resolveFile(file, files, options);
        continue;
      }

      // ./foo > foo.js
      const filejs = file + '.js';
      if (isFile(filejs)) {
        resolveFile(filejs, files, options);
        continue;
      }

      // ./foo > foo/index.js
      const filedir = path.join(file, 'index.js');
      if (isFile(filedir)) {
        resolveFile(filedir, files, options);
        continue;
      }

      // otherwise ignore
      // should throw?
      debug('don\' find %s from %s', file, entry);
      continue;
    }

    // resolve modules
    if (options.ignoreModules) continue;
    files.add(file);
  }
  return files;
}

function isFile(file) {
  return fs.existsSync(file) && fs.statSync(file).isFile();
}
