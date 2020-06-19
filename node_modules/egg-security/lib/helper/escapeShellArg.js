'use strict';

function escapeShellArg(string) {

  const str = '' + string;
  return '\'' + str.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'') + '\'';

}
module.exports = escapeShellArg;
