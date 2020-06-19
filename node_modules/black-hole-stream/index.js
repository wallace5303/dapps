"use strict";

var Writable = require("stream").Writable,
    util = require("util");

/**
 * A Stream which silently drops all incoming data
 * similar to /dev/null on linux/unix
 *
 * @constructor
 */
function BlackHoleStream() {
    Writable.call(this);
}

util.inherits(BlackHoleStream, Writable);

BlackHoleStream.prototype._write = function (chunk, encoding, cb) {
    cb();
};

module.exports = BlackHoleStream;