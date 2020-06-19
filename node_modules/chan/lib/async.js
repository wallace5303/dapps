/**
 * Module dependencies.
 */
var Receiver = require('./receiver')

/**
 * Expose `async`.
 */
module.exports = async

/**
 * Add value to channel via node-style async function.
 *
 * @param {Function} channel
 * @param {Function|Object} fn async function or object with async method
 * @param {String} method name only if fn is an object
 * @param {mixed} args async function arguments without callback
 * @return {Function} thunk
 */
function async(ch, fn/*, args...*/) {
  var args     = [].slice.call(arguments, 2)
  var receiver = new Receiver()
  var context  = null

  if (typeof fn === 'object') {
    context = fn
    fn = fn[args.shift()]
  }

  args.push(function (err, val) {
    if (arguments.length > 2) {
      val = [].slice.call(arguments, 1)
    }
    ch(err, val)(function (err) {
      receiver[err ? 'error' : 'add'](err)
    })
  })

  fn.apply(context, args)

  return function (cb) {
    receiver.callback(cb)
  }
}
