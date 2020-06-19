'use strict';

const first = require('ee-first');

module.exports = function(emitter, events) {
  if (Array.isArray(emitter)) {
    events = emitter;
    emitter = this;
  }
  return new Promise((resolve, reject) => {
    first([
      [ emitter ].concat(events),
    ], (err, ee, event, args) => {
      if (err) {
        reject(err);
      } else {
        resolve({ event, args });
      }
    });
  });
};
