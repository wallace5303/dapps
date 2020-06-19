'use strict';

const fs = require('fs');
const path = require('path');
const is = require('is-type-of');
const glob = require('glob');
const resolveFiles = require('resolve-files');
const debug = require('debug')('ypkgfiles');
const assert = require('assert');

const defaults = {
  cwd: process.cwd(),
  entry: [],
  files: [],
  check: false,
  strict: false,
};

module.exports = options => {
  options = Object.assign({}, defaults, options);

  const cwd = options.cwd;
  const pkg = options.pkg = readPackage(path.join(cwd, 'package.json'));
  const isCheck = options.check;

  // ignore if it's private
  if (pkg.private === true) return;

  const entry = resolveEntry(options);
  debug('get entry %s', entry);
  let files = resolveFiles({ entry, ignoreModules: true });
  debug('get files %s', files);
  files = getFiles(files, cwd);

  if (isCheck) return check(files, pkg.files || [], options.strict);

  pkg.files = files;
  debug('get pkg.files %s', pkg.files);
  writePackage(path.join(cwd, 'package.json'), pkg);
};

function readPackage(pkgPath) {
  const content = fs.readFileSync(pkgPath, 'utf8');
  return JSON.parse(content);
}

function writePackage(pkgPath, obj) {
  const content = JSON.stringify(obj, null, 2) + '\n';
  fs.writeFileSync(pkgPath, content);
}

// return entries with fullpath based on options.entry
function resolveEntry(options) {
  const cwd = options.cwd;
  const pkg = options.pkg;
  let entries = [];
  if (is.array(options.entry)) entries = options.entry;
  if (is.string(options.entry)) entries.push(options.entry);

  const result = new Set();

  try {
    // set the entry that module exports
    result.add(require.resolve(cwd));
  } catch (_) {
    // ignore
  }

  for (let entry of entries) {
    const dir = path.join(cwd, entry);
    // if entry is directory, find all js in the directory
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      entry = path.join(entry, '**/*.js');
    }
    const files = glob.sync(entry, { cwd });
    for (const file of files) {
      result.add(path.join(cwd, file));
    }
  }

  if (pkg.bin) {
    const keys = Object.keys(pkg.bin);
    for (const key of keys) {
      result.add(path.join(cwd, pkg.bin[key]));
    }
  }

  const dts = path.join(cwd, 'index.d.ts');
  if (fs.existsSync(dts)) {
    result.add(dts);
  }

  return Array.from(result);
}

function getFiles(files, cwd) {
  const result = new Set();
  for (let file of files) {
    file = path.relative(cwd, file).split(path.sep)[0];
    if (file !== 'package.json') result.add(file);
  }
  return Array.from(result);
}

function check(files, originalFiles, strict) {
  const msg = `pkg.files should equal to ${toArray(files)}, but got ${toArray(originalFiles)}`;
  if (strict) assert(files.length === originalFiles.length, msg);
  for (const file of files) {
    assert(originalFiles.indexOf(file) > -1, msg);
  }
}

function toArray(arr) {
  return `[ ${arr.join(', ')} ]`;
}
