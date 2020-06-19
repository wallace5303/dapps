'use strict';

const path = require('path');
const Command = require('./lib/command');

class EggBin extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin [command] [options]';

    // load directory
    this.load(path.join(__dirname, 'lib/cmd'));
  }
}

module.exports = exports = EggBin;
exports.Command = Command;
exports.CovCommand = require('./lib/cmd/cov');
exports.DevCommand = require('./lib/cmd/dev');
exports.TestCommand = require('./lib/cmd/test');
exports.DebugCommand = require('./lib/cmd/debug');
exports.PkgfilesCommand = require('./lib/cmd/pkgfiles');
