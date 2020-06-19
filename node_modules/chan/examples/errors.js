// jshint esnext:true

var chan = require('..')
var co   = require('co')
var fs   = require('fs')

co(function *() {
  var ch = chan()

  fs.readFile('something', ch)

  try {
    yield ch
  } catch (err) {
    console.log('failed: %s', err.message)
  }
})()
