#!/usr/bin/env node

'use strict';

const path = require('path');
const co = require('co');
const Command = require('..');

co(function* () {
  yield new Command().run(getAppRoot());
}).catch(err => {
  console.error(err.stack);
  process.exit(1);
});

function getAppRoot() {
  let root;
  const dir = path.dirname(__dirname);
  if (dir.indexOf('.npminstall') >= 0) {
    // ${appName}/node_modules/.npminstall/webstorm-disable-index/1.0.7/webstorm-disable-index
    root = path.join(dir, '../../../../../');
  } else if (/\/\.\d+(\.\d+)+@/.test(dir)) {
    // ${appName}/node_modules/.1.0.7@webstorm-disable-index
    root = path.join(dir, '../../');
  } else {
    // ${appName}/node_modules/webstorm-disable-index
    root = path.join(dir, '../');
  }

  const nmIndex = root.indexOf('node_modules');
  if (nmIndex !== -1) {
    console.log('[webstorm-disable-index] %s', dir);
    root = root.substring(0, nmIndex);
  }

  console.log('[webstorm-disable-index] write files at %s', root);
  return root;
}
