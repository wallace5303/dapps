'use strict';

const debug = require('debug')('cluster-client#follower');
const is = require('is-type-of');
const Base = require('tcp-base');
const Packet = require('./protocol/packet');
const Request = require('./protocol/request');
const Response = require('./protocol/response');

class Follower extends Base {
  /**
   * "Fake" Client, forward request to leader
   *
   * @param {Object} options
   *  - {Number} port - the port
   *  - {Map} descriptors - interface descriptors
   *  - {Transcode} transcode - serialze / deserialze methods
   *  - {Number} responseTimeout - the timeout
   * @constructor
   */
  constructor(options) {
    // local address
    options.host = '127.0.0.1';
    super(options);
    this._publishMethodName = this._findMethodName('publish');
    this._subInfo = new Set();
    this._subData = new Map();
    this._transcode = options.transcode;
    this._closeByUser = false;

    this.on('request', req => this._handleRequest(req));
    // avoid warning message
    this.setMaxListeners(100);
  }
  get isLeader() {
    return false;
  }

  get logger() {
    return this.options.logger;
  }

  get heartBeatPacket() {
    const heartbeat = new Request({
      connObj: {
        type: 'heartbeat',
      },
      timeout: this.options.responseTimeout,
    });
    return heartbeat.encode();
  }

  getHeader() {
    return this.read(24);
  }

  getBodyLength(header) {
    return header.readInt32BE(16) + header.readInt32BE(20);
  }

  close(err) {
    this._closeByUser = true;
    return super.close(err);
  }

  decode(body, header) {
    const buf = Buffer.concat([ header, body ]);
    const packet = Packet.decode(buf);
    const connObj = packet.connObj;
    if (connObj && connObj.type === 'invoke_result') {
      let data;
      if (packet.data) {
        data = this.options.transcode.decode(packet.data);
      }
      if (connObj.success) {
        return {
          id: packet.id,
          isResponse: packet.isResponse,
          data,
        };
      }
      const error = new Error(data.message);
      Object.assign(error, data);
      return {
        id: packet.id,
        isResponse: packet.isResponse,
        error,
      };
    }
    return {
      id: packet.id,
      isResponse: packet.isResponse,
      connObj: packet.connObj,
      data: packet.data,
    };
  }

  send(...args) {
    // just ignore after close
    if (this._closeByUser) {
      return;
    }
    return super.send(...args);
  }

  formatKey(reg) {
    return '$$inner$$__' + this.options.formatKey(reg);
  }

  subscribe(reg, listener) {
    const key = this.formatKey(reg);
    this.on(key, listener);

    // no need duplicate subscribe
    if (!this._subInfo.has(key)) {
      debug('[Follower:%s] subscribe %j for first time', this.options.name, reg);
      const req = new Request({
        connObj: { type: 'subscribe', key, reg },
        timeout: this.options.responseTimeout,
      });

      // send subscription
      this.send({
        id: req.id,
        oneway: true,
        data: req.encode(),
      });
      this._subInfo.add(key);
    } else if (this._subData.has(key)) {
      debug('[Follower:%s] subscribe %j', this.options.name, reg);
      process.nextTick(() => {
        listener(this._subData.get(key));
      });
    }
    return this;
  }

  unSubscribe(reg, listener) {
    const key = this.formatKey(reg);
    if (listener) {
      this.removeListener(key, listener);
    } else {
      this.removeAllListeners(key);
    }
    if (this.listeners(key).length === 0) {
      debug('[Follower:%s] no more subscriber for %j, send unSubscribe req to leader', this.options.name, reg);
      this._subInfo.delete(key);

      const req = new Request({
        connObj: { type: 'unSubscribe', key, reg },
        timeout: this.options.responseTimeout,
      });
      // send subscription
      this.send({
        id: req.id,
        oneway: true,
        data: req.encode(),
      });
    }
  }

  publish(reg) {
    this.invoke(this._publishMethodName, [ reg ]);
    return this;
  }

  invoke(method, args, callback) {
    const oneway = !is.function(callback); // if no callback, means oneway
    const argLength = args.length;
    let data;
    // data:
    // +-----+---------------+-----+---------------+
    // | len |   arg1 body   | len |   arg2 body   |  ...
    // +-----+---------------+-----+---------------+
    if (argLength > 0) {
      let argsBufLength = 0;
      const arr = [];
      for (const arg of args) {
        const argBuf = this._transcode.encode(arg);
        const len = argBuf.length;
        const buf = Buffer.alloc(4 + len);
        buf.writeInt32BE(len, 0);
        argBuf.copy(buf, 4, 0, len);
        arr.push(buf);
        argsBufLength += (len + 4);
      }
      data = Buffer.concat(arr, argsBufLength);
    }
    const req = new Request({
      connObj: {
        type: 'invoke',
        method,
        argLength,
        oneway,
      },
      data,
      timeout: this.options.responseTimeout,
    });
    // send invoke request
    this.send({
      id: req.id,
      oneway,
      data: req.encode(),
    }, callback);
  }

  _registerChannel() {
    const req = new Request({
      connObj: {
        type: 'register_channel',
        channelName: this.options.name,
      },
      timeout: this.options.responseTimeout,
    });
    // send invoke request
    this.send({
      id: req.id,
      oneway: false,
      data: req.encode(),
    }, (err, data) => {
      if (err) {
        // if socket alive, do retry
        if (this._socket) {
          err.message = `register to channel: ${this.options.name} failed, will retry after 3s, ${err.message}`;
          this.logger.warn(err);
          // if exception, retry after 3s
          setTimeout(() => this._registerChannel(), 3000);
        } else {
          this.ready(err);
        }
        return;
      }
      const res = this._transcode.decode(data);
      if (res.success) {
        debug('[Follower:%s] register to channel: %s success', this.options.name, this.options.name);
        this.ready(true);
      } else {
        const error = new Error(res.error.message);
        Object.assign(error, res.error);
        this.ready(error);
      }
    });
  }

  _findMethodName(type) {
    for (const method of this.options.descriptors.keys()) {
      const descriptor = this.options.descriptors.get(method);
      if (descriptor.type === 'delegate' && descriptor.to === type) {
        return method;
      }
    }
    return null;
  }

  _handleRequest(req) {
    debug('[Follower:%s] receive req: %j from leader', this.options.name, req);
    const connObj = req.connObj || {};
    if (connObj.type === 'subscribe_result') {
      const result = this._transcode.decode(req.data);
      this.emit(connObj.key, result);
      this._subData.set(connObj.key, result);
      // feedback
      const res = new Response({
        id: req.id,
        timeout: req.timeout,
        connObj: { type: 'subscribe_result_res' },
      });
      this.send({
        id: req.id,
        oneway: true,
        data: res.encode(),
      });
    }
  }

  _connect(done) {
    if (!done) {
      done = err => {
        if (err) {
          this.ready(err);
        } else {
          // register to proper channel, difference type of client into difference channel
          this._registerChannel();
        }
      };
    }
    super._connect(done);
  }
}

module.exports = Follower;
