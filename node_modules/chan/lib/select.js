/**
 * Module dependencies.
 */
var make    = require('./make')
var Channel = require('./channel')

/**
 * Expose `select`.
 */
module.exports = select

/**
 * Return the first of the given channels with a value.
 *
 * @param {Function} channels...
 * @return {Function}
 * @api public
 */
function select(/*channels...*/) {
  var selectCh = make(arguments.length)
  var chans    = [].slice.call(arguments, 0)

  // get all channels with values waiting
  var full = chans.filter(function (ch) {
    return ch.__chan.items.length + ch.__chan.pendingAdds.length > 0
  })

  // define get callback
  var get = function (err, value) {
    var args = arguments
    var ch   = Channel.lastCalled

    // remove get callback from all selected channels
    chans.forEach(function (ch) { ch.__chan.removeGet(get) })

    // add temporary selected yieldable function
    ch.selected = function (cb) {
      delete ch.selected
      cb.apply(null, args)
    }

    // added the selected channel to the select channel
    selectCh(null, ch)
    selectCh.close()
  }

  if (full.length > 1) {
    // multiple channels with waiting values, pick one at random
    full[Math.floor(Math.random() * full.length)](get)
  } else {
    // add get callback to all channels
    chans.forEach(function (ch) { ch(get) })
  }

  return selectCh
}
