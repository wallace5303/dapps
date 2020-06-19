# Chan

A [golang](http://golang.org) like channel implementation for JavaScript that
works well with [co](https://github.com/visionmedia/co).

[![Build Status](https://travis-ci.org/brentburgoyne/chan.png)](https://travis-ci.org/brentburgoyne/chan)
[![Code Climate](https://codeclimate.com/github/brentburgoyne/chan.png)](https://codeclimate.com/github/brentburgoyne/chan)
[![Dependency Status](https://gemnasium.com/brentburgoyne/chan.png)](https://gemnasium.com/brentburgoyne/chan)

## Features

- CSP Style channels in JavaScript
- Buffered or Unbuffered channels
- Channels can be closed
- API designed to work well with generators and co
- Can be used without generators
- Channels can be selected similar to Go's select statement

## Installation

```bash
$ npm install chan --save
```

## The Basics

Chan is inspired by golang's channels. It is implemented as a function that
represents an asynchronous first in first out queue.

```js
var makeChan = require('chan')
// make a new unbuffered channel
var ch = makeChan()
typeof ch // -> 'function'
```

### Sending values to the channel

Values are added to the
channel by calling the function with either `(value)` or `(error, value)`. The
return value is a thunk (a function that take a node-style callback as its only
argument). The callback given to the thunk is called once the value is added.

```js
ch('foo')(function (err) {
  if (err) {
    // There was an error putting the value on the channel
  } else {
    // The value was successfully put on the channel
  }
})
```

### Receiving values from the channel

Values are removed from the channel by calling it with a node-style callback as
this first argument. When a value is available on the channel the callback is
called with the value or error. In this case the channel itself can also be a
thunk.

```js
ch(function (err, val) {
  // called when there is a value or error on the channel
})
```

### Generators

Because thunks are yield-able in a co generator, chan works very well when
combined with co. Using them together makes chan feel very similar to go
channels.

```js
var co = require('co')

co(function *() {
  var val = yield ch
})

co(function *() {
  yield ch('foo')
})
```

## Buffer

Docs coming soon...

## Close

Docs coming soon...

## Select

Docs coming soon...
