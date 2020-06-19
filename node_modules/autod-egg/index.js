'use strict';

// config/plugin.js or confg/plugin.{env}.js
const PLUGIN_REG = /config\/plugin(\.\w+)*\.js$/;

module.exports = filepath => {
  const modules = [];
  if (!PLUGIN_REG.test(filepath)) return modules;
  try {
    const plugin = require(filepath);
    for (const key in plugin) {
      if (plugin[key].package) modules.push(plugin[key].package);
    }
  } catch (err) {
    return modules;
  }

  return modules;
};
