
# autod

[![NPM version][npm-image]][npm-url]
[![David deps][david-image]][david-url]
[![node version][node-image]][node-url]
[![Gittip][gittip-image]][gittip-url]

[npm-image]: https://img.shields.io/npm/v/autod.svg?style=flat-square
[npm-url]: https://npmjs.org/package/autod
[david-image]: https://img.shields.io/david/node-modules/autod.svg?style=flat-square
[david-url]: https://david-dm.org/node-modules/autod
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[gittip-image]: https://img.shields.io/gittip/dead-horse.svg?style=flat-square
[gittip-url]: https://www.gittip.com/dead-horse/

Auto generate dependencies and devDependencies by parse the project file.
`autod` will parse all the js files in `path`, and get the latest dependencies version from [registry.npmjs.org](https://registry.npmjs.org) or other registries by `-r`.

## install

```bash
$ npm install -g autod
```

## usage

```bash
$ bin/autod -h

 Usage: autod [options]

  Options:

    -h, --help                                           output usage information
    -V, --version                                        output the version number
    -p, --path [root path]                               the root path to be parse
    -t, --test <test/benchmark/example directory paths>  modules in these paths will be tread as devDependencies
    -e, --exclude <exclude directory path>               exclude parse directory, split by `,`
    -r, --registry <remote registry>                     get latest version from which registry
    -f, --prefix [version prefix]                        version prefix, can be `~` or `^`
    -F, --devprefix [dev dependencies version prefix]    develop dependencies version prefix, can be `~` or `^`
    -w, --write                                          write dependencies into package.json
    -i, --ignore                                         ignore errors, display the dependencies or write the dependencies.
    -m, --map                                            display all the dependencies require by which file
    -d, --dep <dependently modules>                      modules that not require in source file, but you need them as dependencies
    -D, --devdep <dev dependently modules>               modules that not require in source file, but you need them in as devDependencies
    -k, --keep <dependently modules>                     modules that you want to keep version in package.json file
    -s, --semver <dependencies@version>                  auto update these modules within the specified semver
```

* Autod will parse all the js files in `path`, and you can exclude folder by `-e, --exclude`.
* All the modules in test folder (can be alter by `-t, --text`) will parsed as devDependencies.
* If you set `-w, --write`, `autod` will write the dependencies into package.json file. `dependencies` will replace `dependencies` in package.json, and `devDependencies` will merge with `devDependencies` in package.json, then write into package file.
* `-f, --prefix` will add prefix to each dependencies' version.
* `-F, --devprefix` will add prefix to each dev dependencies' version.
* `-i, --ignore` will display or wrtie the dependencies even some error happened.
* `-d --dep` will add modules to dependencies even not require by any file.
* `-D --devdep` will add modules to devDependencies even not require by any file.
* `-k --keep` will keep the modules' version in package.json not change by autod.
* `-s, --semver` will update these modules within the specified semver.
* `-n, --notransform` disable transfrom es next, don't support es6 modules.

a simple example of autod:

```
autod -w --prefix="~" -d connect -D mocha,should -k express -s connect@2
```

## Maintains your dependencies in Makefile

add a command in your Makefile

```sh
autod:
    @./node_modules/.bin/autod -w
    @npm install

```

then run `make autod`, it will find all the dependencies and devDependencies in your project,
add / remove dependencies, and bump the versions.

check out some examples:

 - [cnpmjs.org](https://github.com/cnpm/cnpmjs.org/blob/master/Makefile#L95)
 - [koa-generic-session](https://github.com/koajs/generic-session/blob/master/Makefile#L40)

## es6 modules support

All files will compiled by `babel` with `babel-preset-react`, `babel-preset-es2015`, `babel-preset-stage-0`.

## Plugin support

You can write a plugin for autod to decide how to parse dependencies.

- Write a plugin, and publish it to NPM.

```js
module.exports = function (filepath, content) {
  // find the dependencies
  return []; // return dependencies
};
```

- Use plugin:

install plugin from NPM, then use it with `autod`:

```
autod -P pluginName
```

## Config support

You can put all the options in `${cwd}/.autod.conf.js`, when you run `autod`, it will load this file as input options. It can be both a `js` file or a `json` file.

```js
module.exports = {
  write: true,
  prefix: '~',
  devprefix: '^',
  dep: [
    'bluebird'
  ],
  semver: [
    'koa-router@4',
    'koa-compose@2'
  ],
};
```

## License

(The MIT License)

Copyright (c) 2013~2015 dead_horse <dead_horse@qq.com>;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
