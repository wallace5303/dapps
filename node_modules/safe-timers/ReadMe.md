# Safe Timers

## About

Q: What's this all about? Aren't JavaScript timers safe?
A: Long story short: they're a bit broken. This module unbreaks them.

Whether it's by spec, or by accident, **all** major browsers and Node.js limit the interval a setTimeout can accept to a
32 bit signed integer. What that means in essence is that a timeout can never last longer than 24.85 days. Long enough,
right?

The problem is that:

- In human (non-binary) terms, this is a really arbitrary number.
- In long running processes (whether on the web, or in Node), you are limited.
- If the interval you provide overflows this limit, **the timer fires immediately**!

All the arguments about "you shouldn't need intervals this big anyway" go out the window the moment you provide a big
one and instead of never firing, it fires immediately. This is a real problem. And so here we are, Safe Timers solves
this for you.

Does that mean you should forego the browser native setTimeout and setInterval altogether? Absolutely not. Most of the
time, we pass constant short intervals, in which case Safe Timers are overkill. But when your interval comes from some
variable that depends on state or user input, using Safe Timers is a good idea.

## API

**Timer setTimeout(Function callback, number interval, mixed arg1, mixed arg2, ...)**

Calls `callback` after at least `interval` milliseconds have passed. All arguments passed after the `interval` will be
passed to the callback once it gets invoked. Returns a `Timer` instance.

```js
const setTimeout = require('safe-timers').setTimeout;

setTimeout(function (msg) {
  console.log(msg);
}, 5000, 'Hello world');
```

**Timer setTimeoutAt(Function callback, number timestamp, mixed arg1, mixed arg2, ...)**

Calls `callback` when our clock reaches the given `timestamp` (in milliseconds). All arguments passed after the
`interval` will be passed to the callback once it gets invoked. Returns a `Timer` instance.

```js
const setTimeoutAt = require('safe-timers').setTimeoutAt;

setTimeoutAt(function (msg) {
  console.log(msg);
}, Date.now() + 5000, 'Hello world');
```

**Interval setInterval(Function callback, number interval, mixed arg1, mixed arg2, ...)**

Calls `callback` after at least every `interval` milliseconds. All arguments passed after the `interval` will be passed
to the callback when it gets invoked. Returns an `Interval` instance.

```js
const setInterval = require('safe-timers').setInterval;

setInterval(function (msg) {
  console.log(msg);
}, 5000, 'Hello world');
```

**timer.clear() / interval.clear()**

The response from `safetimers.setTimeout[At]` and `safetimers.setInterval` are `Timer` and `Interval` objects
respectively. To cancel a timer or interval, you can call `clear` on it.

```js
const setTimeout = require('safe-timers').setTimeout;

const timer = setTimeout(function (msg) {
  console.log(msg); // this will never show
}, 5000, 'Hello world');

timer.clear();
```
