'use strict';

const net = require('net');
const is = require('is-type-of');
const assert = require('assert');
const Base = require('sdk-base');

const addressKey = Symbol('address');
const defaultOptions = {
  noDelay: true,
  connectTimeout: 3000,
  responseTimeout: 3000,
  heartbeatInterval: 5000,
  needHeartbeat: true,
  concurrent: 0,
  logger: console,
};
const noop = () => {};
let seed = 0;

class TCPBase extends Base {
  /**
   * A base class for tcp client with basic functions
   *
   * @param {Object} options
   *   - {String} host - server host
   *   - {Number} port - server port
   *   - {Number} headerLength - length of the packet header, this field is optional,
   *                             but if you not provider, you must override getHeader method
   *   - {Boolean} [noDelay] - whether use the Nagle algorithm or not，defaults to true
   *   - {Number} [concurrent] - the number of concurrent packet, defaults to zero, means no limit
   *   - {Number} [responseTimeout] - limit the maximum time for waiting a response
   *   - {Logger} [logger] - the logger client
   * @constructor
   */
  constructor(options) {
    super();

    this.options = Object.assign({}, defaultOptions, options);
    if (!this.options.path) {
      assert(this.options.host, 'options.host is required');
      assert(this.options.port, 'options.port is required');
    }

    if (this.options.needHeartbeat) {
      assert(this.heartBeatPacket, 'heartBeatPacket getter must be implemented if needHeartbeat');
    }

    this.clientId = ++seed;
    this._heartbeatTimer = null;
    this._socket = null;
    this._header = null;
    this._bodyLength = null;
    this._lastError = null;
    this._queue = [];
    this._invokes = new Map();
    this[addressKey] = this.options.host + ':' + this.options.port;
    this._lastHeartbeatTime = 0;
    this._lastReceiveDataTime = 0;

    this._connect();
    this.ready(err => {
      if (!err && this.options.needHeartbeat) {
        this._startHeartbeat();
      }
    });
  }

  /**
   * get packet header
   *
   * @return {Buffer} header
   */
  getHeader() {
    return this.read(this.options.headerLength);
  }

  /* eslint-disable valid-jsdoc, no-unused-vars */

  /**
   * get body length from header
   *
   * @param {Buffer} header - header data
   * @return {Number} bodyLength
   */
  getBodyLength(header) {
    throw new Error('not implement');
  }

  /**
   * return a heartbeat packet
   *
   * @property {Buffer} TCPBase#heartBeatPacket
   */
  get heartBeatPacket() {
    throw new Error('not implement');
  }

  /**
   * send heartbeat packet
   *
   * @return {void}
   */
  sendHeartBeat() {
    this._socket.write(this.heartBeatPacket);
  }

  /**
   * deserialze method, leave it to implement by subclass
   *
   * @param {Buffer} buf - binary data
   * @return {Object} packet object
   */
  decode(buf) {
    throw new Error('not implement');
  }

  /* eslint-enable valid-jsdoc, no-unused-vars */

  /**
   * if the connection is writable, also including flow control logic
   *
   * @property {Boolean} TCPBase#_writable
   */
  get _writable() {
    if (this.options.concurrent && this._invokes.size >= this.options.concurrent) {
      return false;
    }

    return this.isOK;
  }

  /**
   * if the connection is healthy or not
   *
   * @property {Boolean} TCPBase#isOK
   */
  get isOK() {
    return this._socket && this._socket.writable;
  }

  /**
   * remote address
   *
   * @property {String} TCPBase#address
   */
  get address() {
    return this[addressKey];
  }

  /**
   * logger
   *
   * @property {Logger} TCPBase#logger
   */
  get logger() {
    return this.options.logger;
  }

  /**
   * Pulls some data out of the socket buffer and returns it.
   * If no data available to be read, null is returned
   *
   * @param {Number} n - to specify how much data to read
   * @return {Buffer} - data
   */
  read(n) {
    return this._socket.read(n);
  }

  /**
   * send packet to server
   *
   * @param {Object} packet
   *   - {Number} id - packet id
   *   - {Buffer} data - binary data
   *   - {Boolean} [oneway] - oneway or not
   *   - {Number} [timeout] - the maximum time for waiting a response
   * @param {Function} [callback] - Call this function，when processing is complete, optional.
   * @return {void}
   */
  send(packet, callback = noop) {
    if (!this._socket) {
      const err = new Error(`[TCPBase] The socket was closed. (address: ${this[addressKey]})`);
      err.id = packet.id;
      err.data = packet.data.toString('base64');
      if (packet.oneway) {
        err.oneway = true;
        callback();
        this.emit('error', err);
      } else {
        callback(err);
      }
      return;
    }
    if (packet.oneway) {
      this._socket.write(packet.data);
      callback();
      return;
    }
    if (!this._writable) {
      this._queue.push([ packet, callback ]);
      return;
    }
    const meta = {
      id: packet.id,
      dataLength: packet.data.length,
      bufferSize1: this._socket.bufferSize,
      bufferSize2: -1,
      startTime: Date.now(),
      endTime: -1,
    };
    let endTime;
    meta.writeSuccess = this._socket.write(packet.data, () => {
      endTime = Date.now();
    });
    const timeout = packet.timeout || this.options.responseTimeout;
    this._invokes.set(packet.id, {
      meta,
      packet,
      timer: setTimeout(() => {
        meta.bufferSize2 = this._socket.bufferSize;
        meta.endTime = endTime;
        this._finishInvoke(packet.id);
        const err = new Error(`Server no response in ${timeout}ms, address#${this[addressKey]}`);
        err.socketMeta = meta;
        err.name = 'ResponseTimeoutError';
        callback(err);
      }, timeout),
      callback,
    });
  }

  /**
   * thunk style api of send(packet, callback)
   *
   * @param {Object} packet
   *   - {Number} id - packet id
   *   - {Buffer} data - binary data
   *   - {Boolean} [oneway] - oneway or not
   *   - {Number} [timeout] - the maximum time for waiting a response
   * @return {Function} thunk function
   */
  sendThunk(packet) {
    return callback => this.send(packet, callback);
  }

  _finishInvoke(id) {
    this._invokes.delete(id);
    if (this._writable) {
      this._resume();
    }
  }

  _errorCallback(callback, err) {
    if (!err) {
      err = new Error(`The socket was closed. (address: ${this[addressKey]})`);
      err.name = 'SocketCloseError';
    }
    callback && callback(err);
  }

  // mark all invokes timeout
  _cleanInvokes(err) {
    for (const id of this._invokes.keys()) {
      const req = this._invokes.get(id);
      clearTimeout(req.timer);
      this._errorCallback(req.callback, err);
    }
    this._invokes.clear();
  }

  // clean up the queue
  _cleanQueue(err) {
    let args = this._queue.pop();
    while (args) {
      // args[0] 是packet， args[1]是callback
      this._errorCallback(args[1], err);
      args = this._queue.pop();
    }
  }

  _resume() {
    const args = this._queue.shift();
    if (args) {
      this.send(args[0], args[1]);
    }
  }

  // read data from socket，and decode it to packet object
  _readPacket() {
    if (is.nullOrUndefined(this._bodyLength)) {
      this._header = this.getHeader();
      if (!this._header) {
        return false;
      }
      this._bodyLength = this.getBodyLength(this._header);
    }

    let body;
    if (this._bodyLength > 0) {
      body = this.read(this._bodyLength);
      if (!body) {
        return false;
      }
    }
    this._bodyLength = null;
    const entity = this.decode(body, this._header);
    // the schema of entity
    // {
    //   id: 'request id',
    //   isResponse: true,
    //   data: {}  // deserialized object
    // }
    let type = 'request';
    if (!entity.hasOwnProperty('isResponse')) {
      entity.isResponse = this._invokes.has(entity.id);
    }
    if (entity.isResponse) {
      type = 'response';
      const invoke = this._invokes.get(entity.id);
      if (invoke) {
        this._finishInvoke(entity.id);
        clearTimeout(invoke.timer);
        process.nextTick(() => {
          invoke.callback(entity.error, entity.data);
        });
      }
    }
    if (entity.data) {
      process.nextTick(() => {
        this.emit(type, entity, this[addressKey]);
      });
    }
    return true;
  }

  /**
   * close the socket
   *
   * @param {Error} err - the error which makes socket closed
   * @return {void}
   */
  close(err) {
    if (!this._socket) {
      return Promise.resolve();
    }
    this._socket.destroy(err);
    return this.await('close');
  }

  _handleClose() {
    if (!this._socket) {
      return;
    }
    this._socket.removeAllListeners();
    this._socket = null;

    this._cleanInvokes(this._lastError);
    // clean timer
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
    this._cleanQueue(this._lastError);
    this.emit('close');
  }

  _handleReadable() {
    this._lastReceiveDataTime = Date.now();
    try {
      let remaining = false;
      do {
        remaining = this._readPacket();
      } while (remaining);
    } catch (err) {
      this.close(err);
    }
  }

  _connect(done) {
    if (!done) {
      done = err => {
        this.ready(err ? err : true);
      };
    }
    const { port, host, localAddress, localPort, family, hints, lookup, path } = this.options;
    const socket = this._socket = net.connect({
      port, host, localAddress, localPort, family, hints, lookup, path,
    });
    socket.setNoDelay(this.options.noDelay);
    socket.on('readable', () => { this._handleReadable(); });
    socket.once('close', () => { this._handleClose(); });
    socket.once('error', err => {
      err.message += ' (address: ' + this[addressKey] + ')';
      this._lastError = err;
      if (err.code === 'ECONNRESET') {
        this.logger.warn('[TCPBase] socket is closed by other side while there were still unhandled data in the socket buffer');
      } else {
        this.emit('error', err);
      }
    });
    socket.setTimeout(this.options.connectTimeout, () => {
      const err = new Error(`[TCPBase] socket connect timeout (${this.options.connectTimeout}ms)`);
      err.name = 'TcpConnectionTimeoutError';
      err.host = this.options.host;
      err.port = this.options.port;
      this.close(err);
    });

    socket.once('connect', () => {
      // set timeout back to zero after connected
      socket.setTimeout(0);
      this.emit('connect');
    });

    Promise.race([
      this.await('connect'),
      this.await('error'),
    ]).then(done, done);
  }

  _startHeartbeat() {
    this._heartbeatTimer = setInterval(() => {
      const duration = this._lastHeartbeatTime - this._lastReceiveDataTime;
      if (this._lastReceiveDataTime && duration > this.options.heartbeatInterval) {
        const err = new Error(`server ${this[addressKey]} no response in ${duration}ms, maybe the socket is end on the other side.`);
        err.name = 'ServerNoResponseError';
        this.close(err);
        return;
      }
      // flow control
      if (this._invokes.size > 0 || !this.isOK) {
        return;
      }
      this._lastHeartbeatTime = Date.now();
      this.sendHeartBeat();
    }, this.options.heartbeatInterval);
  }
}

module.exports = TCPBase;
