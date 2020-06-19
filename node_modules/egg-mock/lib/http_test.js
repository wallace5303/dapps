'use strict';

const Test = require('supertest').Test;

class EggTest extends Test {
  /**
   * Unexpectations:
   *
   *   .unexpectHeader('Content-Type')
   *   .unexpectHeader('Content-Type', fn)
   *
   * @return {EggTest}
   * @api public
   */

  unexpectHeader(name, b) {
    if (typeof b === 'function') {
      this.end(b);
    }

    // header
    if (typeof name === 'string') {
      this._asserts.push(this._unexpectHeader.bind(this, name));
    }
    return this;
  }

  /**
   * Expectations:
   *
   *   .expectHeader('Content-Type')
   *   .expectHeader('Content-Type', fn)
   *
   * @return {EggTest}
   * @api public
   */

  expectHeader(name, b) {
    if (typeof b === 'function') {
      this.end(b);
    }

    // header
    if (typeof name === 'string') {
      this._asserts.push(this._expectHeader.bind(this, name));
    }
    return this;
  }

  _unexpectHeader(name, res) {
    const actual = res.headers[name.toLowerCase()];
    if (actual) {
      return new Error('unexpected "' + name + '" header field, got "' + actual + '"');
    }
  }

  _expectHeader(name, res) {
    const actual = res.headers[name.toLowerCase()];
    if (!actual) {
      return new Error('expected "' + name + '" header field');
    }
  }
}

module.exports = EggTest;
