/**
 * Expose `Receiver`.
 */
module.exports = Receiver

/**
 * Initialize a `Receiver`.
 *
 * @param {Mixed} val
 * @api private
 */
function Receiver(val) {
  this.val   = val
  this.isAdded = false
  this.err   = null
  this.cb    = null
  this.isDone  = false
}

/**
 * Call the callback if the pending add is complete.
 *
 * @api private
 */
Receiver.prototype.attemptNotify = function () {
  if ((this.isAdded || this.err) && this.cb && !this.isDone) {
    this.isDone = true
    setImmediate(function () { this.cb(this.err) }.bind(this))
  }
}

/**
 * Reject the pending add with an error.
 *
 * @param {Error} err
 * @api private
 */
Receiver.prototype.error = function (err) {
  this.err = err
  this.attemptNotify()
}

/**
 * Get the `val` and set the state of the value to added
 *
 * @return {Mixed} val
 * @api private
 */
Receiver.prototype.add = function () {
  this.isAdded = true
  this.attemptNotify()
  return this.val
}

/**
 * Register the callback.
 *
 * @api private
 */
Receiver.prototype.callback = function (cb) {
  this.cb = cb
  this.attemptNotify()
}
