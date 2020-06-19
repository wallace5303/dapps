'use strict';

const Constant = require('../const');
const byteBuffer = require('./byte_buffer');
const Long = require('long');

/**
 * 0         1         2                   4                                                                              12
 * +---------+---------+-------------------+-------------------------------------------------------------------------------+
 * | version | req/res |      reserved     |                                 request id                                    |
 * +---------------------------------------+---------------------------------------+---------------------------------------+
 * |                timeout                |       connection object length        |       application object length       |
 * +---------------------------------------+-------------------+-------------------+---------------------------------------+
 * |         conn object (JSON format)  ...                    |                        app object                         |
 * +-----------------------------------------------------------+                                                           |
 * |                                                                  ...                                                  |
 * +-----------------------------------------------------------------------------------------------------------------------+
 *
 * packet protocol:
 *   (1B): protocol version
 *   (1B): req/res
 *   (2B): reserved
 *   (8B): request id
 *   (4B): timeout
 *   (4B): connection object length
 *   (4B): application object length
 *   --------------------------------
 *   conn object (JSON format)
 *   --------------------------------
 *   app object
 */
class Packet {
  /**
   * cluster protocol packet
   *
   * @param {Object} options
   *   - @param {Number} id - The identifier
   *   - @param {Number} type - req/res
   *   - @param {Number} timeout - The timeout
   *   - @param {Object} connObj - connection object
   *   - @param {Buffer} data - app data
   * @constructor
   */
  constructor(options) {
    this.id = options.id;
    this.type = options.type;
    this.timeout = options.timeout;
    this.connObj = options.connObj;
    this.data = typeof options.data === 'string' ? Buffer.from(options.data) : options.data;
  }

  get isResponse() {
    return this.type === Constant.RESPONSE;
  }

  encode() {
    const header = Buffer.from([ Constant.VERSION, this.type, 0, 0 ]);
    const connBuf = Buffer.from(JSON.stringify(this.connObj));
    const appLen = this.data ? this.data.length : 0;

    byteBuffer.reset();
    byteBuffer.put(header);
    byteBuffer.putLong(this.id);
    byteBuffer.putInt(this.timeout);
    byteBuffer.putInt(connBuf.length);
    byteBuffer.putInt(appLen);
    byteBuffer.put(connBuf);
    if (appLen) {
      byteBuffer.put(this.data);
    }
    return byteBuffer.array();
  }

  static decode(buf) {
    const isResponse = buf[1] === Constant.RESPONSE;
    const id = new Long(
      buf.readInt32BE(8), // low, high
      buf.readInt32BE(4)
    ).toNumber();
    const timeout = buf.readInt32BE(12);
    const connLength = buf.readInt32BE(16);
    const appLength = buf.readInt32BE(20);

    const connBuf = Buffer.alloc(connLength);
    buf.copy(connBuf, 0, 24, 24 + connLength);
    const connObj = JSON.parse(connBuf);

    let data;
    if (appLength) {
      data = Buffer.alloc(appLength);
      buf.copy(data, 0, 24 + connLength, 24 + connLength + appLength);
    }
    return {
      id,
      isResponse,
      timeout,
      connObj,
      data,
    };
  }
}

module.exports = Packet;
