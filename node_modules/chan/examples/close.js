// jshint esnext:true

var chan = require('..')
var co   = require('co')
var wait = require('co-wait')
var ch   = chan()

co(function *() {
  var val
  while (!ch.done()) {
    val = yield ch
    if (val !== ch.empty) {
      console.log(val)
    }
  }
  console.log('Done!')
})()

co(function *() {
  var n = 10

  while (n-- > 0) {
    yield wait(100)
    try {
      ch(n)
    } catch(err) {
      console.log(err.message)
    }

    if (n === 5) {
      ch.close()
    }
  }
})()
