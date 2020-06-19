/**
 * Module dependencies.
 */
var Receiver = require('./receiver')

/**
 * Expose `Channel`.
 */
module.exports = Channel

/**
 * Constants.
 */
var CLOSED_ERROR_MSG = 'Cannot add to closed channel'

/**
 * Initialize a `Channel`.
 *
 * @param {Function|Object} [empty=Object]
 * @api private
 */
function Channel(bufferSize) {
  this.pendingAdds = []
  this.pendingGets = []
  this.items       = []
  this.bufferSize  = parseInt(bufferSize, 10) || 0
  this.isClosed    = false
  this.isDone      = false
  this.empty       = {}
}

/**
 * Static reference to the most recently called callback
 */
Channel.lastCalled = null

/**
 * Get an item with `cb`.
 *
 * @param {Function} cb
 * @api private
 */
Channel.prototype.get = function (cb){
  if (this.done()) {
    this.callEmpty(cb)
  } else if (this.items.length > 0 || this.pendingAdds.length > 0) {
    this.call(cb, this.nextItem())
  } else {
    this.pendingGets.push(cb)
  }
}

/**
 * Remove `cb` from the queue.
 *
 * @param {Function} cb
 * @api private
 */
Channel.prototype.removeGet = function (cb) {
  var idx = this.pendingGets.indexOf(cb)
  if (idx > -1) {
    this.pendingGets.splice(idx, 1)
  }
}

/**
 * Get the next item and pull from pendingAdds to fill the buffer.
 *
 * @return {Mixed}
 * @api private
 */
Channel.prototype.nextItem = function () {
  if (this.pendingAdds.length > 0) {
    this.items.push(this.pendingAdds.shift().add())
  }
  return this.items.shift()
}

/**
 * Add `val` to the channel.
 *
 * @param {Mixed} val
 * @return {Function} thunk
 * @api private
 */
Channel.prototype.add = function (val){
  var receiver = new Receiver(val)

  if (this.isClosed) {
    receiver.error(Error(CLOSED_ERROR_MSG))
  } else if (this.pendingGets.length > 0) {
    this.call(this.pendingGets.shift(), receiver.add())
  } else if (this.items.length < this.bufferSize) {
    this.items.push(receiver.add())
  } else {
    this.pendingAdds.push(receiver)
  }

  return function (cb) {
    receiver.callback(cb)
  }
}

/**
 * Invoke `cb` with `val` facilitate both
 * `chan(value)` and the `chan(error, value)`
 * use-cases.
 *
 * @param {Function} cb
 * @param {Mixed} val
 * @api private
 */
Channel.prototype.call = function (cb, val) {
  Channel.lastCalled = this.func
  if (val instanceof Error) {
    cb(val)
  } else {
    cb(null, val)
  }
  this.done()
}

/**
 * Invoke `cb` callback with the empty value.
 *
 * @param {Function} cb
 * @api private
 */
Channel.prototype.callEmpty = function (cb) {
  this.call(cb, this.empty)
}

/**
 * Prevennt future values from being added to
 * the channel.
 *
 * @return {Boolean}
 * @api public
 */
Channel.prototype.close = function () {
  this.isClosed = true
  var receiver
  while (receiver = this.pendingAdds.shift()) {
    receiver.error(Error(CLOSED_ERROR_MSG))
  }
  return this.done()
}

/**
 * Check to see if the channel is done and
 * call pending callbacks if necessary.
 *
 * @return {Boolean}
 * @api private
 */
Channel.prototype.done = function () {
  if (!this.isDone && this.isClosed && this.items.length === 0) {
    this.isDone = true
    // call each pending callback with the empty value
    this.pendingGets.forEach(function (cb) { this.callEmpty(cb) }, this)
  }
  return this.isDone
}
