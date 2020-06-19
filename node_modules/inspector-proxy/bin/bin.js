#! /usr/bin/env node

'use strict';

const path = require('path');
const cfork = require('cfork');
const InterceptorProxy = require('../');
const packInfo = require('../package');
const argv = process.argv;
const DEFAULT_PROXY_PORT = 9229;
const DEFAULT_DEBUG_PORT = 5858;

// show help
if (argv.includes('--help') || argv.includes('-h')) {
  return console.log(
    '\n' +
      'Usage: inspector-proxy [options] [script.js]\n\n' +
      'Options:\n' +
      '   -h, --help             help \n' +
      '   -v, --version          show version \n' +
      '   --proxy=port           proxy port(default: ' + DEFAULT_PROXY_PORT + ') \n' +
      '   --debug=port           node debug port(default: ' + DEFAULT_DEBUG_PORT + ') \n' +
      '   --silent=silent        cfork silent(default: false) \n' +
      '   --refork=refork        cfork refork(default: true) \n' +
      '   --file=file            cfork exec file \n'
  );
} else if (argv.includes('--version') || argv.includes('-v')) {
  return console.log(packInfo.version);
}

const proxyPort = getArg('--proxy') || DEFAULT_PROXY_PORT;
const debugPort = getArg('--debug') || DEFAULT_DEBUG_PORT;
const silent = getArg('--silent') === 'true';
const refork = getArg('--refork') !== 'false';
let jsFile = getArg('--file') || argv[argv.length - 1];
const proxy = new InterceptorProxy({ port: proxyPort, silent });

// don't run cfork while missing js file
if (path.extname(jsFile) !== '.js') {
  return proxy.start({ proxyPort, debugPort })
    .then(() => {
      console.log(`\nproxy url: ${proxy.url}\n`);
    });
}

if (!path.isAbsolute(jsFile)) {
  jsFile = path.resolve(process.cwd(), jsFile);
}

// prevent cfork print epipe error
/* istanbul ignore next */
process.on('uncaughtException', err => {
  if (err.code !== 'EPIPE') {
    console.error(err);
  }
});

// hack to make cfork start with debugPort
process.debugPort = debugPort - 1;

// fork js
cfork({
  exec: jsFile,
  execArgv: [ '--inspect' ],
  silent,
  count: 1,
  refork,
}).on('fork', worker => {
  let port = debugPort;
  worker.process.spawnargs.find(arg => {
    let matches;
    if (arg.startsWith('--inspect') && (matches = arg.match(/\d+/))) {
      port = matches[0];
      return true;
    }
    return false;
  });

  proxy.start({ proxyPort, debugPort: port })
    .then(() => {
      console.log(`\nproxy url: ${proxy.url}\n`);
    });
});

function getArg(arg) {
  const key = `${arg}=`;
  const result = argv.find(item => item.startsWith(key));
  if (result) {
    return result.substring(key.length);
  }
}
