/**
 * Module dependencies.
 */
var Channel = require('./channel')
var async   = require('./async')

/**
 * Expose `make`.
 */
module.exports = make

/**
 * Make a channel.
 *
 * @param {Number} bufferSize optional default=0
 * @return {Function}
 * @api public
 */
function make(bufferSize) {
  var chan = new Channel(bufferSize)

  var func = function (a, b) {
    // yielded
    if (typeof a === 'function') {
      return chan.get(a)
    }

    // (err, res)
    if (a === null && typeof b !== 'undefined') {
      a = b
    }

    // value
    return chan.add(a)
  }

  // expose public channel methods
  func.close = chan.close.bind(chan)
  func.done  = chan.done.bind(chan)

  // bind async helper
  func.async = async.bind(null, func)

  // expose empty value
  func.empty = chan.empty

  // cross reference the channel object and function for internal use
  func.__chan = chan
  chan.func   = func

  return func
}
