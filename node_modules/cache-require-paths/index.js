var Module = require('module');
var fs = require('fs');
var exists = fs.existsSync;

var _require = Module.prototype.require;
var SAVE_FILENAME =
  process.env.CACHE_REQUIRE_PATHS_FILE ?
  process.env.CACHE_REQUIRE_PATHS_FILE :
  './.cache-require-paths.json';
var nameCache;
try {
  nameCache = exists(SAVE_FILENAME) ? JSON.parse(fs.readFileSync(SAVE_FILENAME, 'utf-8')) : {};
} catch (err) {
  nameCache = {};
}

var currentModuleCache;
var pathToLoad;

Module.prototype.require = function cachePathsRequire(name) {

  currentModuleCache = nameCache[this.filename];
  if (!currentModuleCache) {
    currentModuleCache = {};
    nameCache[this.filename] = currentModuleCache;
  }
  if (currentModuleCache[name] &&
    // Some people hack Object.prototype to insert their own properties on
    // every dictionary (for example, the 'should' testing framework). Check
    // that the key represents a path.
    typeof currentModuleCache[name] === 'string') {
    pathToLoad = currentModuleCache[name];
  } else {
    pathToLoad = Module._resolveFilename(name, this);
    currentModuleCache[name] = pathToLoad;
  }

  try {
    return _require.call(this, pathToLoad);
  } catch (err) {
    // Cache may be outdated; resolve and try again
    pathToLoad = Module._resolveFilename(name, this);
    currentModuleCache[name] = pathToLoad;
    return _require.call(this, pathToLoad);
  }
};

function printCache() {
  Object.keys(nameCache).forEach(function (fromFilename) {
    console.log(fromFilename);
    var moduleCache = nameCache[fromFilename];
    Object.keys(moduleCache).forEach(function (name) {
      console.log(' ', name, '->', moduleCache[name]);
    });
  });
}

process.once('exit', function () {
  try {
    fs.writeFileSync(SAVE_FILENAME,
      JSON.stringify(nameCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('cache-require-paths: Failed saving cache: ' + err.toString());
  }
});
