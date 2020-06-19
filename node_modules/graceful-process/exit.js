'use strict';

const assert = require('assert');
const is = require('is-type-of');
const once = require('once');

module.exports = getExitFunction;

function getExitFunction(beforeExit, logger, label) {
  if (beforeExit) assert(is.function(beforeExit), 'beforeExit only support function');

  return once(code => {
    if (!beforeExit) process.exit(code);
    Promise.resolve()
      .then(() => {
        return beforeExit();
      })
      .then(() => {
        logger.info('[%s] beforeExit success', label);
        process.exit(code);
      })
      .catch(err => {
        logger.error('[%s] beforeExit fail, error: %s', label, err.message);
        process.exit(code);
      });
  });

}
