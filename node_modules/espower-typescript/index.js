/* eslint node/no-deprecated-api: [error, {ignoreGlobalItems: ["require.extensions"]}] */

'use strict';

const path = require('path');
const espowerSource = require('espower-source');
const minimatch = require('minimatch');
const sourceMapSupport = require('source-map-support');
const tsNodeRegister = require('ts-node').register;
const sourceCache = {};

function espowerTypeScript(options, tsNodeOptions) {
  tsNodeRegister(tsNodeOptions);

  // install source-map-support again to correct the source-map
  sourceMapSupport.install({
    environment: 'node',
    retrieveFile: path => sourceCache[path],
  });

  const {extensions = ['ts', 'tsx']} = options;
  extensions.forEach(ext => {
    espowerTsRegister(`.${ext}`, options);
  });
}

function espowerTsRegister(ext, options) {
  const cwd = options.cwd || process.cwd();
  const pattern = path.join(cwd, options.pattern);

  const originalExtension = require.extensions[ext];
  require.extensions[ext] = (module, filepath) => {
    if (!minimatch(filepath, pattern)) {
      return originalExtension(module, filepath);
    }
    const originalCompile = module._compile;
    module._compile = function(code, filepath) {
      const newSource = espowerSource(code, filepath, options);
      sourceCache[filepath] = newSource;
      return originalCompile.call(this, newSource, filepath);
    };
    return originalExtension(module, filepath);
  };
}

module.exports = espowerTypeScript;
