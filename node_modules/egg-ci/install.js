'use strict';

const nunjucks = require('nunjucks');
const path = require('path');
const fs = require('fs');

const engine = nunjucks.configure({
  autoescape: false,
  watch: false,
});

let root;
// support npminstall path
if (__dirname.indexOf('.npminstall') >= 0) {
  root = path.join(__dirname, '../../../../..');
} else {
  root = path.join(__dirname, '../..');
}

if (process.env.CI_ROOT_FOR_TEST) {
  root = process.env.CI_ROOT_FOR_TEST;
}

let pkg;
try {
  pkg = require(path.join(root, 'package.json'));
} catch (err) {
  console.error('read package.json error: %s', err.message);
  console.error('[egg-ci] stop create ci yml');
  process.exit(0);
}

const config = Object.assign({
  type: 'travis, appveyor, github', // default is travis, appveyor and github
  version: '',
  npminstall: true,
  // auto detect nyc_output/*.json files, please use on travis windows platfrom
  nyc: false,
  license: false,
}, pkg.ci);
if (!('afterScript' in config)) {
  const codecovCMD = config.nyc ? 'codecov --disable=gcov -f .nyc_output/*.json' : 'codecov';
  if (config.npminstall) {
    config.afterScript = `
after_script:
  - npminstall codecov && ${codecovCMD}
`.trim();
  } else {
    config.afterScript = `
after_script:
  - npm i codecov && ${codecovCMD}
`.trim();
  }
}

config.types = arrayify(config.type);
config.versions = arrayify(config.version);
if (config.services) config.services = arrayify(config.services);
if (config.versions.length === 0) {
  const installNode = pkg.engines && (pkg.engines['install-node'] ||
    pkg.engines['install-alinode']);
  if (!installNode) {
    // default version is LTS
    config.versions = [ '8', '10', '12' ];
  }
}

const defaultOS = {
  travis: '',
  'azure-pipelines': 'linux, windows, macos',
  github: 'linux, windows, macos',
};

if (pkg.ci && pkg.ci.os) {
  config.os = Object.assign(defaultOS, pkg.ci.os);
} else {
  config.os = defaultOS;
}
for (const platfrom in config.os) {
  config.os[platfrom] = arrayify(config.os[platfrom]);
}
if (config.os && config.os.travis && config.os.travis.length === 0) {
  config.os.travis = null;
}

const originCommand = config.command;
if (typeof originCommand === 'string') {
  config.command = {
    travis: originCommand,
    appveyor: originCommand,
    github: originCommand,
    'azure-pipelines': originCommand,
  };
}
config.command = Object.assign({
  travis: 'ci',
  appveyor: 'test',
  'azure-pipelines': 'ci',
  github: 'ci',
}, config.command);

let ymlName = '';
let ymlContent = '';
let ymlName2 = '';
let ymlContent2 = '';

for (const type of config.types) {
  if (type === 'travis') {
    ymlContent = engine.renderString(getTpl('travis'), config);
    ymlName = '.travis.yml';
  } else if (type === 'appveyor') {
    ymlContent = engine.renderString(getTpl('appveyor'), config);
    ymlName = 'appveyor.yml';
  } else if (type === 'github') {
    const versions = config.versions.map(v => {
      return /^\d+$/.test(v) ? `${v}.x` : `${v}`;
    });
    const os = config.os.github.map(name => {
      if (name === 'linux') name = 'ubuntu';
      return `${name}-latest`;
    });
    ymlContent = getTpl('github.yml')
      .replace('{{github_node_version}}', versions.join(', '))
      .replace('{{github_os}}', os.join(', '))
      .replace('{{github_command_ci}}', config.command.github)
      .replace('{{github_npm_install}}', config.npminstall ? 'npm i -g npminstall && npminstall' : 'npm i');
    ymlName = '.github/workflows/nodejs.yml';
    let dir = path.join(root, '.github');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    dir = path.join(root, '.github', 'workflows');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  } else if (type === 'azure-pipelines') {
    ymlContent = engine.renderString(getTpl('azure-pipelines.yml'), config);
    ymlName = 'azure-pipelines.yml';
    ymlContent2 = engine.renderString(getTpl('azure-pipelines.template.yml'), config);
    ymlName2 = 'azure-pipelines.template.yml';
  } else {
    throw new Error(`${type} type not support`);
  }
  const ymlPath = path.join(root, ymlName);
  fs.writeFileSync(ymlPath, ymlContent);
  console.log(`[egg-ci] create ${ymlPath} success`);
  if (ymlName2) {
    const ymlPath2 = path.join(root, ymlName2);
    fs.writeFileSync(ymlPath2, ymlContent2);
    console.log(`[egg-ci] create ${ymlPath2} success`);
  }
}

if (config.license) {
  let data = {
    year: '2017',
    fullname: 'Alibaba Group Holding Limited and other contributors.',
  };
  if (typeof config.license === 'object') {
    data = Object.assign(data, config.license);
  }
  if (Number(data.year) < new Date().getFullYear()) {
    data.year = `${data.year}-present`;
  }
  const licenseContent = engine.renderString(getTpl('license'), data);
  const licensePath = path.join(root, 'LICENSE');
  fs.writeFileSync(licensePath, licenseContent);
  console.log(`[egg-ci] create ${licensePath} success`);
}

function getTpl(name) {
  return fs.readFileSync(path.join(__dirname, 'templates', name), 'utf8');
}

function arrayify(str) {
  if (Array.isArray(str)) return str;
  return str.split(/\s*,\s*/).filter(s => !!s);
}
