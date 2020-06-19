// jshint esnext: true, loopfunc: true

var chan  = require('..')
var co    = require('co')

co(function *() {
  var count = 10
    , ch1
    , ch2

  while (count-- > 0) {
    // macke new channels
    ch1 = chan()
    ch2 = chan()

    // add a value on each channel after a random amout of time
    setTimeout(function () { ch1('ch1') }, Math.random() * 100 | 0)
    setTimeout(function () { ch2('ch2') }, Math.random() * 100 | 0)

    // will block until there is data on either ch1 or ch2,
    // and will return the channel with data
    // if data is on both channels, a channel will be selected at random
    switch (yield chan.select(ch1, ch2)) {

      // channel 1 received data
      case ch1:
        // retrieve the message from the channel
        console.log(yield ch1.selected)
        break

      // channel 2 received data
      case ch2:
        // retrieve the message from the channel
        console.log(yield ch2.selected)
        break

    }
  }

})()
