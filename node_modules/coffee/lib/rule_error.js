'use strict';

const is = require('is-type-of');
const Rule = require('./rule');

class ErrorRule extends Rule {
  validate(message) {
    // only validate when got error
    if (!this.ctx.error) return;
    return super.validate(message);
  }

  assert(actual, expected, message) {
    if (is.error(expected)) expected = expected.message;
    return super.assert(actual.message, expected, message);
  }
}

module.exports = ErrorRule;
