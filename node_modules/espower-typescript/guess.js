'use strict';

const path = require('path');
const ts = require('typescript');

const cwd = process.cwd();
const compilerOptions = loadCompilerOptions(cwd) || {};
const extensions = ['ts', 'tsx'];
if (compilerOptions.allowJs) {
  extensions.push('js');
  extensions.push('jsx');
}

let testDir = 'test';
const packageData = require(path.join(cwd, 'package.json'));
if (
  packageData &&
  typeof packageData.directories === 'object' &&
  typeof packageData.directories.test === 'string'
) {
  testDir = packageData.directories.test;
}
const pattern = path.join(testDir, `**/*.@(${extensions.join('|')})`);

require('./index')({cwd, pattern, extensions});

function loadCompilerOptions(cwd) {
  const tsconfigPath = ts.findConfigFile(cwd, ts.sys.fileExists);
  if (!tsconfigPath) {
    return null;
  }
  const result = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (result.error) {
    throw new Error(result.error.messageText);
  }
  if (result.config && result.config.compilerOptions) {
    const basepath = path.dirname(tsconfigPath);
    const {options} = ts.parseJsonConfigFileContent(result.config, ts.sys, basepath);
    return options;
  }
  return null;
}
