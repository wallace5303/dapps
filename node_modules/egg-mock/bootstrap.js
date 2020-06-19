'use strict';

const assert = require('power-assert');
const path = require('path');
const mock = require('./index').default;

const options = {};
if (process.env.EGG_BASE_DIR) options.baseDir = process.env.EGG_BASE_DIR;

// throw error when an egg plugin test is using bootstrap
const pkgInfo = require(path.join(options.baseDir || process.cwd(), 'package.json'));
if (pkgInfo.eggPlugin) throw new Error('DO NOT USE bootstrap to test plugin');

const app = mock.app(options);

if (typeof beforeAll === 'function') {
  // jest
  beforeAll(() => app.ready());
} else {
  // mocha
  before(() => app.ready());
}
afterEach(() => app.backgroundTasksFinished());
// restore should be the last one
afterEach(mock.restore);

module.exports = {
  assert,
  app,
  mock,
  mm: mock,
};
