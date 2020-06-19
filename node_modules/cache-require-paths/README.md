# cache-require-paths

> Caches resolved paths in module require to avoid Node hunting for right module. Speeds up app load.

[![NPM][cache-require-paths-icon] ][cache-require-paths-url]

[![Build status][cache-require-paths-ci-image] ][cache-require-paths-ci-url]
[![semantic-release][semantic-image] ][semantic-url]

[cache-require-paths-icon]: https://nodei.co/npm/cache-require-paths.png?downloads=true
[cache-require-paths-url]: https://npmjs.org/package/cache-require-paths
[cache-require-paths-ci-image]: https://travis-ci.org/bahmutov/cache-require-paths.png?branch=master
[cache-require-paths-ci-url]: https://travis-ci.org/bahmutov/cache-require-paths
[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-url]: https://github.com/semantic-release/semantic-release

This is a partial solution to Node "hunting" for right file to load when you require a 3rd party
dependency. See [Node’s `require` is dog slow](https://kev.inburke.com/kevin/node-require-is-dog-slow/) 
and [Faster Node app require](http://glebbahmutov.com/blog/faster-node-app-require/) for details.

## Use

    npm install --save cache-require-paths

Load the module first in your application file

```js
// index.js
require('cache-require-paths');
...
```

The first time the app loads, a cache of resolved file paths will be saved to `.cache-require-paths.json`
in the current directory.  Every application startup after that will reuse this filename cache to avoid
"hunting" for the right filename.

To save cached paths to a different file, set the environmental variable `CACHE_REQUIRE_PATHS_FILE`.

## Results

Here are results for loading common packages without and with caching resolved require paths.
You can run any of this experiments inside the `test` folder. `node index.js` loads
using the standard resolve. `node index.js --cache` uses a cache of the resolves paths.

Using node 0.10.37

    require('X')    |  standard (ms)  |  with cache (ms)  |  speedup (%)
    ------------------------------------------------------------------
    express@4.12.3  |        72       |       46          |     36
    karma@0.12.31   |       230       |      170          |     26
    grunt@0.4.5     |       120       |       95          |     20
    sails@0.11.0    |       170       |      120          |     29

Using node 0.12.2 - all startup times became slower.

    require('X')    |  standard (ms)  |  with cache (ms)  |  speedup (%)
    ------------------------------------------------------------------
    express@4.12.3  |        90       |       55          |     38
    karma@0.12.31   |       250       |      200          |     20
    grunt@0.4.5     |       150       |      120          |     20
    sails@0.11.0    |       200       |      145          |     27

## TODO

- [ ] Cache only the absolute paths (relative paths resolve quickly)
- [ ] Invalidate cache if dependencies in the package.json change

## Discussion

You can see Node on Mac OS X searchig for a file to load when loading an absolute path
like `require(express)` by using the following command to make a log of all system level
calls from Node (start this from another terminal before running node program)

    sudo dtruss -d -n 'node' > /tmp/require.log 2>&1

Then run the test program, for example in the `test` folder run

    $ node index.js

Kill the `dtruss` process and open the generated `/tmp/require.log`. It shows every system call
with the following 4 columns: process id (should be single node process), relative time (microseconds),
system call with arguments, and after the equality sign the numerical result of the call.

When loading `express` dependency from the test program using `require('express');` we see
the following search (I abbreviated paths for clarity):

    # microseconds call
    664730 stat64(".../test/node_modules/express\0", 0x7FFF5FBFECF8, 0x204)        = 0 0
    664784 stat64(".../test/node_modules/express.js\0", 0x7FFF5FBFED28, 0x204)         = -1 Err#2
    664834 stat64(".../test/node_modules/express.json\0", 0x7FFF5FBFED28, 0x204)       = -1 Err#2
    664859 stat64(".../test/node_modules/express.node\0", 0x7FFF5FBFED28, 0x204)       = -1 Err#2
    664969 open(".../test/node_modules/express/package.json\0", 0x0, 0x1B6)        = 11 0
    664976 fstat64(0xB, 0x7FFF5FBFEC38, 0x1B6)         = 0 0
    665022 read(0xB, "{\n  \"name\": \"express\", ...}", 0x103D)        = 4157 0
    665030 close(0xB)      = 0 0

By default, Node checks if the local `node_modules/express` folder exists first (first `stat64` call),
Then it tries to check the status of the `node_modules/express.js` file and fails. 
Then `node_modules/express.json` file. Then `node_modules/express.node` file. Finally it opens
the `node_modules/express/package.json` file and reads the contents. 

Note that this is not the end of the story. Node loader only loads `express/package.json` to fetch
`main` filename or use the default `index.js`! Each wasted file system call takes only 100 microseconds,
but the tiny delays add up to hundreds of milliseconds and finally seconds for larger frameworks.

Profile the same program with `--cache` option added to the command line arguments

    $ node index.js --cache

This option loads the `cache-require-paths` module as the first require of the application

```js
var useCache = process.argv.some(function (str) {
  return str === '--cache';
});
if (useCache) {
  console.log('using filename cache');
  require('cache-require-paths');
}
```

The trace now shows *no calls to find `express` package*, just straight load of the `express/index.js` file.

    643466 stat64(".../node_modules/express/index.js\0", 0x7FFF5FBFED28, 0x3)         = 0 0
    643501 lstat64(".../node_modules\0", 0x7FFF5FBFED08, 0x3)         = 0 0
    643513 lstat64(".../node_modules/express\0", 0x7FFF5FBFED08, 0x3)         = 0 0
    643523 lstat64(".../node_modules/express/index.js\0", 0x7FFF5FBFED08, 0x3)        = 0 0
    643598 open(".../node_modules/express/index.js\0", 0x0, 0x1B6)        = 12 0
    643600 fstat64(0xC, 0x7FFF5FBFED58, 0x1B6)         = 0 0

Mission achieved. Note that the speedup only happens after the first application run finishes successfully.
The resolution cache needs to be saved to a local file, and this happens only on process exit.

## Small print

Author: Gleb Bahmutov &copy; 2015

* [@bahmutov](https://twitter.com/bahmutov)
* [glebbahmutov.com](http://glebbahmutov.com)
* [blog](http://glebbahmutov.com/blog)

License: MIT - do anything with the code, but don't blame me if it does not work.

Spread the word: tweet, star on github, etc.

Support: if you find any problems with this module, email / tweet /
[open issue](https://github.com/bahmutov/cache-require-paths/issues) on Github
