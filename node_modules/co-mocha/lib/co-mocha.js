var co = require('co')
var isGenFn = require('is-generator').fn

/**
 * Export `co-mocha`.
 */
module.exports = coMocha

/**
 * Monkey patch the mocha instance with generator support.
 *
 * @param {Function} mocha
 */
function coMocha (mocha) {
  // Avoid loading `co-mocha` twice.
  if (!mocha || mocha._coMochaIsLoaded) {
    return
  }

  var Runnable = mocha.Runnable
  var run = Runnable.prototype.run

  /**
   * Override the Mocha function runner and enable generator support with co.
   *
   * @param {Function} fn
   */
  Runnable.prototype.run = function (fn) {
    var oldFn = this.fn

    if (isGenFn(oldFn)) {
      this.fn = co.wrap(oldFn)

      // Replace `toString` to output the original function contents.
      this.fn.toString = function () {
        // https://github.com/mochajs/mocha/blob/7493bca76662318183e55294e906a4107433e20e/lib/utils.js#L251
        return Function.prototype.toString.call(oldFn)
          .replace(/^function *\* *\(.*\)\s*{/, 'function () {')
      }
    }

    return run.call(this, fn)
  }

  mocha._coMochaIsLoaded = true
}

/**
 * Find active node mocha instances.
 *
 * @return {Array}
 */
function findNodeJSMocha () {
  var children = require.cache || {}

  return Object.keys(children)
    .filter(function (child) {
      var val = children[child].exports
      return typeof val === 'function' && val.name === 'Mocha'
    })
    .map(function (child) {
      return children[child].exports
    })
}

// Attempt to automatically monkey patch available mocha instances.
var modules = typeof window === 'undefined' ? findNodeJSMocha() : [window.Mocha]

modules.forEach(coMocha)
