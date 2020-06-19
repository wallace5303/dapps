# Await Event

A really stupid utility I use frequently for event emitters.
Allows you to `yield` an event and return the results.
I use this a lot of locking.

Note: you probably shouldn't use this for the `error` event.

## Example

```js
var PassThrough = require('stream').PassThrough

var stream = new PassThrough()
// you attach it directly on an event emitter
stream.await = require('await-event')

co(function* () {
  var chunk = yield stream.await('data')
  var chunk = yield stream.await('data')
  var chunk = yield stream.await('data')
}).catch(noop)

stream.write('some chunk')
```

You can use awaitEvent without attach on an event emitter:

```js
var EventEmitter = require('event')

var emitter = new EventEmitter()
co(function*() {
  yield awaitEvent(emitter, 'ready')
}).catch(noop)
```

When use this for `error` event, it will reject once `error` event emitted:

```js
var EventEmitter = require('event')

var emitter = new EventEmitter()
co(function*() {
  // it will throw when `error` event emitted
  yield awaitEvent(emitter, 'error')
}).catch(err => console.error(err.stack))
```
