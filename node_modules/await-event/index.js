'use strict'

module.exports = function(emitter, event) {
  if (typeof emitter === 'string') {
    event = emitter
    emitter = this
  }

  return new Promise((resolve, reject) => {
    const done = event === 'error' ? reject : resolve
    emitter.once(event, done)
  })
}
