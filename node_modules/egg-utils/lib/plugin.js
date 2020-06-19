'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const os = require('os');
const mkdirp = require('mkdirp');

const tmpDir = os.tmpdir();
const logger = {
  debug: noop,
  info: noop,
  warn: noop,
  error: noop,
};

exports.getPlugins = opt => {
  const loader = getLoader(opt);
  loader.loadPlugin();
  return loader.allPlugins;
};

exports.getLoadUnits = opt => {
  const loader = getLoader(opt);
  loader.loadPlugin();
  return loader.getLoadUnits();
};

exports.getConfig = opt => {
  const loader = getLoader(opt);
  loader.loadPlugin();
  loader.loadConfig();
  return loader.config;
};

function getLoader({ framework, baseDir, env }) {
  assert(framework, 'framework is required');
  assert(fs.existsSync(framework), `${framework} should exist`);
  if (!(baseDir && fs.existsSync(baseDir))) {
    baseDir = path.join(tmpDir, String(Date.now()), 'tmpapp');
    mkdirp.sync(baseDir);
    fs.writeFileSync(path.join(baseDir, 'package.json'), JSON.stringify({ name: 'tmpapp' }));
  }

  const EggLoader = findEggCore({ baseDir, framework }).EggLoader;
  const { Application } = require(framework);
  if (env) process.env.EGG_SERVER_ENV = env;
  return new EggLoader({
    baseDir,
    logger,
    app: Object.create(Application.prototype),
  });
}

function findEggCore({ baseDir, framework }) {
  try {
    const name = 'egg-core';
    return require(name);
  } catch (_) {
    let eggCorePath = path.join(baseDir, 'node_modules/egg-core');
    if (!fs.existsSync(eggCorePath)) {
      eggCorePath = path.join(framework, 'node_modules/egg-core');
    }
    assert(fs.existsSync(eggCorePath), `Can't find egg-core from ${baseDir} and ${framework}`);
    return require(eggCorePath);
  }
}

function noop() {}
