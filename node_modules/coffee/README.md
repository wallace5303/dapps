# Coffee

Test command line on Node.js.

---

[![NPM version](https://img.shields.io/npm/v/coffee.svg?style=flat)](https://npmjs.org/package/coffee)
[![Build Status](https://img.shields.io/travis/node-modules/coffee.svg?style=flat)](https://travis-ci.org/node-modules/coffee)
[![codecov.io](https://img.shields.io/codecov/c/github/node-modules/coffee.svg?style=flat)](http://codecov.io/github/node-modules/coffee?branch=master)
[![NPM downloads](http://img.shields.io/npm/dm/coffee.svg?style=flat)](https://npmjs.org/package/coffee)

## Install

```bash
$ npm i coffee --save-dev
```

## Usage

Coffee is useful for test command line in test frammework (like Mocha).

### Fork

You can use `fork` for spawning Node processes.

```js
const coffee = require('coffee');

describe('cli', () => {
  it('should fork node cli', () => {
    return coffee.fork('/path/to/file.js')
    .expect('stdout', '12\n')
    .expect('stderr', /34/)
    .expect('code', 0)
    .end();
  });
});
```

In file.js

```js
console.log(12);
console.error(34);
```

You can pass `args` and `opts` to [child_process fork](https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options).

```js
coffee.fork('/path/to/file.js', [ 'args' ], { execArgv: [ '--inspect' ]})
  .expect('stdout', '12\n')
  .expect('stderr', '34\n')
  .expect('code', 0)
  .end();
```

And more:

```js
coffee.fork('/path/to/file.js')
  // print origin stdio
  .debug()

  // inject a script
  .beforeScript(mockScript)

  // interact with prompt
  .waitForPrompt()
  .write('tz\n')

  // string strict equals
  .expect('stdout', 'abcdefg')
  // regex
  .expect('stdout', /^abc/)
  // multiple
  .expect('stdout', [ 'abcdefg', /abc/ ])
  .expect('code', 0)
  .end();
```

see the API chapter below for more details.

### Spwan

You can also use `spawn` for spawning normal shell scripts.

```js
coffee.spawn('cat')
  .write('1')
  .write('2')
  .expect('stdout', '12')
  .expect('code', 0)
  .end();
```

## Rule

### code

Check the exit code.

```js
coffee.fork('/path/to/file.js', [ 'args' ])
  .expect('code', 0)
  // .expect('code', 1)
  .end();
```

### stdout / stderr

Check the stdout and stderr.

```js
coffee.fork('/path/to/file.js', [ 'args' ])
  .expect('stdout', '12\n')
  .expect('stderr', '34\n')
  .expect('code', 0)
  .end();
```

### custom

Support custom rules, see `test/fixtures/extendable` for more details.

```js
const { Coffee, Rule } = require('coffee');

class FileRule extends Rule {
  constructor(opts) {
    super(opts);
    // `args` is which pass to `expect(type, ...args)`, `expected` is the first args.
    const { args, expected } = opts;
  }

  assert(actual, expected, message) {
    // do sth
    return super.assert(fs.existsSync(expected), true, `should exists file ${expected}`);
  }
}

class MyCoffee extends Coffee {
  constructor(...args) {
    super(...args);
    this.setRule('file', FileRule);
  }

  static fork(modulePath, args, opt) {
    return new MyCoffee({
      method: 'fork',
      cmd: modulePath,
      args,
      opt,
    });
  }
}
```

Usage:

```js
// test/custom.test.js
const coffee = require('MyCoffee');
coffee.fork('/path/to/file.js', [ 'args' ])
  .expect('file', `${root}/README.md`);
  .notExpect('file', `${root}/not-exist`);
```

## Support multiple process coverage with nyc

Recommend to use [nyc] for coverage, you can use [any test frammework supported by nyc](https://istanbul.js.org/docs/tutorials/).

## API

### coffee.spawn

Run command using `child_process.spawn`, then return `Coffee` instance.

Arguments see [child_process.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)

### coffee.fork

Run command using `child_process.fork`, then return `Coffee` instance.

Arguments see [child_process.fork](http://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options)

### coffee.Coffee

Assertion object

#### coffee.expect(type, ...args)

Assert type with expected value, expected value can be string, regular expression, and array.

```js
coffee.spawn('echo', [ 'abcdefg' ])
  .expect('stdout', 'abcdefg')
  .expect('stdout', /^abc/)
  .expect('stdout', [ 'abcdefg', /abc/ ])
  .end();
```

Accept type: `stdout` / `stderr` / `code` / `error`, see built-in rules description above.

#### coffee.notExpect(type, ...args)

The opposite assertion of `expect`.

#### coffee.write(data)

Write data to stdin.

```js
coffee.fork(path.join(fixtures, 'stdin.js'))
  .write('1\n')
  .write('2')
  .expect('stdout', '1\n2')
  .end();
```

#### coffee.writeKey(...args)

Write special key sequence to stdin, support `UP` / `DOWN` / `LEFT` / `RIGHT` / `ENTER` / `SPACE`.

All args will join as one key.

```js
coffee.fork(path.join(fixtures, 'stdin.js'))
  .writeKey('1', 'ENTER', '2')
  .expect('stdout', '1\n2')
  .end();
```

#### coffee.waitForPrompt(bool)

If you set false, coffee will write stdin immediately, otherwise will wait for `prompt` message.

```js
coffee.fork('/path/to/cli', [ 'abcdefg' ])
  .waitForPrompt()
  .write('tz\n')
  // choose the second item
  .writeKey('DOWN', 'DOWN', 'ENTER');
  .end(done);
```

**cli process should emit `prompt` message:**

> Or use `coffee.on('stdout', callback)` instead, see docs below.

```js
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(q, callback) {
  process.send({ type: 'prompt' });
  rl.question(q, callback);
}

ask('What\'s your name? ', answer => {
  console.log(`hi, ${answer}`);
  ask('How many coffee do you want? ', answer => {
    console.log(`here is your ${answer} coffee`);
    rl.close();
  });
});
```

#### coffee.end([callback])

Callback will be called after completing the assertion, the first argument is Error if throw exception.

```js
coffee.fork('path/to/cli')
  .expect('stdout', 'abcdefg')
  .end(done);

// recommended to left undefind and use promise style.
const { stdout, stderr, code } = await coffee.fork('path/to/cli').end();
assert(stdout.includes(abcdefg));
```

#### coffee.on(event, callback)

Emit `stdout/stderr` event.

use for kill long-run process:

```js
coffee.fork('path/to/cli')
  .on('stdout', (buf, { proc }) => {
    if (buf.includes('egg-ready')) {
      proc.exitCode = 0;
      proc.kill();
    }
  })
  .expect('stdout', 'egg-ready')
  .end(done);
```

use for prompt:

```js
// do not call `waitForPrompt` / `write` / `writeKey`
coffee.fork('path/to/cli')
  .on('stdout', (buf, { proc }) => {
    if (buf.includes('Your Name: ')) {
      proc.stdin.write('TZ\n');
    }
  })
  .expect('stdout', 'Your Name: TZ\n')
  .end(done);
```

#### coffee.debug(level)

Write data to process.stdout and process.stderr for debug

`level` can be

- 0 (default): pipe stdout + stderr
- 1: pipe stdout
- 2: pipe stderr
- false: disable

Alternative you can use `COFFEE_DEBUG` env.

#### coffee.coverage()

If you set false, coffee will not generate coverage.json, default: true.

#### coffee.beforeScript(scriptFile)

Add a hook script before fork child process run.

### coffee.Rule

Assertion Rule base class.

## LICENSE

Copyright (c) 2017 - 2019 node-modules. Licensed under the MIT license.

[nyc]: https://github.com/istanbuljs/nyc
