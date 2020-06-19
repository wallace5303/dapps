#!/usr/bin/env node

'use strict';

const argv = require('yargs')
  .version()
  .alias('V', 'version')
  .boolean('check')
  .boolean('strict')
  .argv;

try {
  require('..')({
    cwd: argv.cwd || process.cwd(),
    entry: argv.entry,
    files: argv.files,
    check: argv.check,
    strict: argv.strict,
  });
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
