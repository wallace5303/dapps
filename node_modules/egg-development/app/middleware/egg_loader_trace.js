'use strict';

const path = require('path');
const fs = require('mz/fs');
const utility = require('utility');

module.exports = (_, app) => {
  return async (ctx, next) => {
    if (ctx.path !== '/__loader_trace__') return await next();
    const template = await fs.readFile(path.join(__dirname, '../../lib/loader_trace.html'), 'utf8');
    const data = await loadTimingData(app);
    ctx.body = template.replace('{{placeholder}}', JSON.stringify(data));
  };
};

async function loadTimingData(app) {
  const rundir = app.config.rundir;
  const files = await fs.readdir(rundir);
  const data = [];
  for (const file of files) {
    if (!/^(agent|application)_timing/.test(file)) continue;
    const json = await utility.readJSON(path.join(rundir, file));
    const isAgent = /^agent/.test(file);
    for (const item of json) {
      if (isAgent) {
        item.type = 'agent';
      } else {
        item.type = `app_${item.pid}`;
      }
      item.pid = String(item.pid);
      item.range = [ item.start, item.end ];
      item.title = `${item.type}(${item.index})`;
      data.push(item);
    }
  }
  return data;
}
