'use strict';

const debug = require('debug')('cluster-client#leader');
const co = require('co');
const is = require('is-type-of');
const Base = require('sdk-base');
const utils = require('./utils');
const random = require('utility').random;
const ClusterServer = require('./server');
const Connection = require('./connection');
const Request = require('./protocol/request');
const Response = require('./protocol/response');

class Leader extends Base {
  /**
   * The Leader hold the real client
   *
   * @param {Object} options
   *  - {String} name - client name, default is the class name
   *  - {ClusterServer} server - the cluster server
   *  - {Boolean} isBroadcast - whether broadcast subscrption result to all followers or just one, default is true
   *  - {Number} heartbeatInterval - the heartbeat interval
   *  - {Function} createRealClient - to create the real client
   * @constructor
   */
  constructor(options) {
    super(options);
    this._connections = new Map();
    this._subListeners = new Map(); // subscribe key => listener
    this._subConnMap = new Map(); // subscribe key => conn key
    this._subData = new Map();
    // local socket server
    this._server = this.options.server;
    this._transcode = this.options.transcode;
    this._isReady = false;
    this._closeByUser = false;
    // the real client
    this._realClient = this.options.createRealClient();
    this._subscribeMethodName = this._findMethodName('subscribe');
    this._publishMethodName = this._findMethodName('publish');

    // event delegate
    utils.delegateEvents(this._realClient, this);

    if (is.function(this._realClient.ready)) {
      this._realClient.ready(err => {
        if (err) {
          this.ready(err);
        } else {
          this._isReady = true;
          this.ready(true);
        }
      });
    } else {
      this._isReady = true;
      this.ready(true);
    }

    this._handleConnection = this._handleConnection.bind(this);

    // subscribe its own channel
    this._server.on(`${this.options.name}_connection`, this._handleConnection);
    this._server.once('close', () => { this.emit('server_closed'); });
    this.on('server_closed', () => {
      this._handleClose().catch(err => { this.emit('error', err); });
    });

    // maxIdleTime is 3 times of heartbeatInterval
    const heartbeatInterval = this.options.heartbeatInterval;
    const maxIdleTime = this.options.heartbeatInterval * 3;

    this._heartbeatTimer = setInterval(() => {
      const now = Date.now();
      for (const conn of this._connections.values()) {
        const dur = now - conn.lastActiveTime;
        if (dur > maxIdleTime) {
          const err = new Error(`client no response in ${dur}ms exceeding maxIdleTime ${maxIdleTime}ms, maybe the connection is close on other side.`);
          err.name = 'ClusterClientNoResponseError';
          conn.close(err);
        }
      }
    }, heartbeatInterval);
  }

  get isLeader() {
    return true;
  }

  get logger() {
    return this.options.logger;
  }

  formatKey(reg) {
    return '$$inner$$__' + this.options.formatKey(reg);
  }

  subscribe(reg, listener) {
    const transcode = this._transcode;
    const conn = Object.create(Base.prototype, {
      isMock: { value: true },
      key: { value: `${this.options.name}_mock_conn_${utils.nextId()}` },
      lastActiveTime: {
        get() {
          return Date.now();
        },
      },
      listener: {
        get() {
          return listener;
        },
      },
      send: {
        value(req) {
          const result = transcode.decode(req.data);
          process.nextTick(() => {
            listener(result);
          });
        },
      },
      close: { value() {} },
    });
    conn.once('close', () => {
      this._connections.delete(conn.key);
      for (const connKeySet of this._subConnMap.values()) {
        connKeySet.delete(conn.key);
      }
    });

    this._connections.set(conn.key, conn);
    this._doSubscribe(reg, conn);
  }

  unSubscribe(reg, listener) {
    const key = this.formatKey(reg);
    const connKeySet = this._subConnMap.get(key) || new Set();
    const newConnKeySet = new Set();
    for (const connKey of connKeySet.values()) {
      const conn = this._connections.get(connKey);
      if (!conn) {
        continue;
      }
      if (conn.isMock && (!listener || conn.listener === listener)) {
        this._connections.delete(connKey);
        continue;
      }
      newConnKeySet.add(connKey);
    }
    this._subConnMap.set(key, newConnKeySet);
  }

  publish(reg) {
    this._realClient[this._publishMethodName](reg);
  }

  invoke(methodName, args, callback) {
    let method = this._realClient[methodName];
    // compatible with generatorFunction
    if (is.generatorFunction(method)) {
      method = co.wrap(method);
    }
    args.push(callback);
    const ret = method.apply(this._realClient, args);
    if (callback && is.promise(ret)) {
      ret.then(result => callback(null, result), err => callback(err))
        // to avoid uncaught exception in callback function, then cause unhandledRejection
        .catch(err => { this._errorHandler(err); });
    }
  }

  _doSubscribe(reg, conn) {
    const key = this.formatKey(reg);
    const callback = err => {
      if (err) {
        this._errorHandler(err);
      }
    };
    const isBroadcast = this.options.isBroadcast;
    const timeout = this.options.responseTimeout;

    const connKeySet = this._subConnMap.get(key) || new Set();
    connKeySet.add(conn.key);
    this._subConnMap.set(key, connKeySet);

    // only subscribe once in cluster mode, and broadcast to all followers
    if (!this._subListeners.has(key)) {
      const listener = result => {
        const data = this._transcode.encode(result);
        this._subData.set(key, data);

        const connKeySet = this._subConnMap.get(key);
        if (!connKeySet) {
          return;
        }
        let keys = Array.from(connKeySet.values());
        // if isBroadcast equal to false, random pick one to notify
        if (!isBroadcast) {
          keys = [ keys[random(keys.length)] ];
        }

        for (const connKey of keys) {
          const conn = this._connections.get(connKey);
          if (conn) {
            debug('[Leader:%s] push subscribe data to cluster client#%s', this.options.name, connKey);
            conn.send(new Request({
              timeout,
              connObj: {
                type: 'subscribe_result',
                key,
              },
              data,
            }), callback);
          }
        }
      };
      this._subListeners.set(key, listener);
      this._realClient[this._subscribeMethodName](reg, listener);
    } else if (this._subData.has(key) && isBroadcast) {
      conn.send(new Request({
        timeout,
        connObj: {
          type: 'subscribe_result',
          key,
        },
        data: this._subData.get(key),
      }), callback);
    }
  }

  _findMethodName(type) {
    return utils.findMethodName(this.options.descriptors, type);
  }

  // handle new socket connect
  _handleConnection(socket, req) {
    debug('[Leader:%s] socket connected, port: %d', this.options.name, socket.remotePort);

    const conn = new Connection({
      socket,
      name: this.options.name,
      logger: this.logger,
      transcode: this.options.transcode,
      requestTimeout: this.options.requestTimeout,
    });
    this._connections.set(conn.key, conn);
    conn.once('close', () => {
      this._connections.delete(conn.key);
      for (const connKeySet of this._subConnMap.values()) {
        connKeySet.delete(conn.key);
      }
    });
    conn.on('error', err => this._errorHandler(err));
    conn.on('request', (req, res) => this._handleRequest(req, res, conn));

    // handle register channel request
    const res = new Response({
      id: req.id,
      timeout: req.timeout,
    });
    this._handleRequest(req, res, conn);
  }

  _handleSubscribe(req, conn) {
    const connObj = req.connObj || {};
    this._doSubscribe(connObj.reg, conn);
  }

  _handleUnSubscribe(req, conn) {
    const connObj = req.connObj || {};
    const key = this.formatKey(connObj.reg);
    const connKeySet = this._subConnMap.get(key) || new Set();
    connKeySet.delete(conn.key);
    this._subConnMap.set(key, connKeySet);
  }

  // handle request from followers
  _handleRequest(req, res, conn) {
    const connObj = req.connObj || {};
    // update last active time to make sure not kick out by leader
    conn.lastActiveTime = Date.now();

    switch (connObj.type) {
      case 'subscribe':
        debug('[Leader:%s] received subscribe request from follower, req: %j, conn: %s', this.options.name, req, conn.key);
        this._handleSubscribe(req, conn);
        break;
      case 'unSubscribe':
        debug('[Leader:%s] received unSubscribe request from follower, req: %j, conn: %s', this.options.name, req, conn.key);
        this._handleUnSubscribe(req, conn);
        break;
      case 'invoke':
      {
        debug('[Leader:%s] received invoke request from follower, req: %j, conn: %s', this.options.name, req, conn.key);
        const argLength = connObj.argLength;
        const args = [];
        if (argLength > 0) {
          const data = req.data;
          for (let i = 0, offset = 0; i < argLength; ++i) {
            const len = data.readUInt32BE(offset);
            const arg = this._transcode.decode(data.slice(offset + 4, offset + 4 + len));
            args.push(arg);
            offset += (4 + len);
          }
        }

        if (connObj.oneway) {
          this.invoke(connObj.method, args);
        } else {
          const startTime = Date.now();
          this.invoke(connObj.method, args, (err, result) => {
            // no response if processing timeout, just record error
            if (req.timeout && Date.now() - startTime > req.timeout) {
              const err = new Error(`[Leader:${this.options.name}] invoke method:${connObj.method} timeout for req#${req.id}`);
              err.name = 'ClusterLeaderTimeoutError';
              err.method = connObj.method;
              err.args = args;
              this._errorHandler(err);
              return;
            }

            if (err) {
              const data = Object.assign({
                stack: err.stack,
                name: err.name,
                message: err.message,
              }, err);
              err.method = connObj.method;
              err.args = connObj.args;
              this._errorHandler(err);

              res.connObj = {
                type: 'invoke_result',
                success: false,
              };
              res.data = this._transcode.encode(data);
            } else {
              debug('[Leader:%s] send method:%s result to follower, result: %j', this.options.name, connObj.method, result);
              const data = this._transcode.encode(result);
              res.connObj = {
                type: 'invoke_result',
                success: true,
              };
              res.data = data;
            }
            conn.send(res);
          });
        }
        break;
      }
      case 'heartbeat':
        debug('[Leader:%s] received heartbeat request from follower, req: %j, conn: %s', this.options.name, req, conn.key);
        res.connObj = { type: 'heartbeat_res' };
        conn.send(res);
        break;
      case 'register_channel':
        // make sure response after leader is ready
        this.ready(err => {
          if (err) {
            res.connObj = { type: 'register_channel_res' };
            const data = Object.assign({
              message: err.message,
              stack: err.stack,
              name: err.name,
            }, err);
            res.data = this._transcode.encode({
              success: false,
              error: data,
            });
          } else {
            res.connObj = { type: 'register_channel_res' };
            res.data = this._transcode.encode({ success: true });
          }
          conn.send(res);
        });
        break;
      default:
      {
        const err = new Error(`unsupport data type: ${connObj.type}`);
        err.name = 'ClusterRequestTypeError';
        this._errorHandler(err);
        break;
      }
    }
  }

  // emit error asynchronously
  _errorHandler(err) {
    setImmediate(() => {
      if (!this._closeByUser) {
        this.emit('error', err);
      }
    });
  }

  async _handleClose() {
    debug('[Leader:%s] leader server is closed', this.options.name);
    // close the real client
    if (this._realClient) {
      const originClose = this._findMethodName('close');
      if (originClose) {
        // support common function, generatorFunction, and function returning a promise
        await utils.callFn(this._realClient[originClose].bind(this._realClient));
      }
    }
    clearInterval(this._heartbeatTimer);
    this._heartbeatTimer = null;
    this.emit('close');
  }

  async close() {
    this._closeByUser = true;
    debug('[Leader:%s] try to close leader', this.options.name);
    // 1. stop listening to server channel
    this._server.removeListener(`${this.options.name}_connection`, this._handleConnection);

    // 2. close all mock connections
    for (const conn of this._connections.values()) {
      if (conn.isMock) {
        conn.emit('close');
      }
    }

    // 3. close server
    //    CANNOT close server directly by server.close(), other cluster clients may be using it
    this.removeAllListeners('server_closed');
    await ClusterServer.close(this.options.name, this._server);

    // 5. close real client
    await this._handleClose();
  }
}

module.exports = Leader;
