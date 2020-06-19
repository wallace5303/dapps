'use strict';

var http = require('http');
var cluster = require('cluster');
var ms = require('humanize-ms');
var pstree = require('ps-tree');

/**
 * graceful, please use with `cluster` in production env.
 *
 * @param {Object} options
 *  - {Array<HttpServer>} servers, we need to close it and stop taking new requests.
 *  - {Function(err, throwErrorCount)} [error], when uncaughtException emit, error(err, count).
 *    You can log error here.
 *  - {Number} [killTimeout], worker suicide timeout, default is 30 seconds.
 *  - {Object} [worker], worker contains `disconnect()`.
 */
module.exports = function graceful(options) {
  options = options || {};
  var killTimeout = ms(options.killTimeout || '30s');
  var onError = options.error || function () {};
  var servers = options.servers || options.server || [];
  if (!Array.isArray(servers)) {
    servers = [servers];
  }
  if (servers.length === 0) {
    throw new TypeError('options.servers required!');
  }

  var throwErrorCount = 0;
  process.on('uncaughtException', function (err) {
    throwErrorCount += 1;
    onError(err, throwErrorCount);
    console.error('[%s] [graceful:worker:%s:uncaughtException] throw error %d times',
      Date(), process.pid, throwErrorCount);
    console.error(err);
    console.error(err.stack);
    if (throwErrorCount > 1) {
      return;
    }

    servers.forEach(function (server) {
      if (server instanceof http.Server) {
        server.on('request', function (req, res) {
          // Let http server set `Connection: close` header, and close the current request socket.
          req.shouldKeepAlive = false;
          res.shouldKeepAlive = false;
          if (!res._header) {
            res.setHeader('Connection', 'close');
          }
        });
      }
    });

    // make sure we close down within `killTimeout` seconds
    var killtimer = setTimeout(function () {
      console.error('[%s] [graceful:worker:%s] kill timeout, exit now.', Date(), process.pid);
      if (process.env.NODE_ENV !== 'test') {
        // kill children by SIGKILL before exit
        killChildren(function() {
          process.exit(1);
        });
      }
    }, killTimeout);
    console.error('[%s] [graceful:worker:%s] will exit after %dms', Date(), process.pid, killTimeout);

    // But don't keep the process open just for that!
    // If there is no more io waitting, just let process exit normally.
    if (typeof killtimer.unref === 'function') {
      // only worked on node 0.10+
      killtimer.unref();
    }

    var worker = options.worker || cluster.worker;

    // cluster mode
    if (worker) {
      try {
        // stop taking new requests.
        // because server could already closed, need try catch the error: `Error: Not running`
        for (var i = 0; i < servers.length; i++) {
          var server = servers[i];
          server.close();
          console.error('[%s] [graceful:worker:%s] close server#%s, _connections: %s',
            Date(), process.pid, i, server._connections);
        }
        console.error('[%s] [graceful:worker:%s] close %d servers!',
          Date(), process.pid, servers.length);
      } catch (er1) {
        // Usually, this error throw cause by the active connections after the first domain error,
        // oh well, not much we can do at this point.
        console.error('[%s] [graceful:worker:%s] Error on server close!\n%s',
          Date(), process.pid, er1.stack);
      }

      try {
        // Let the master know we're dead.  This will trigger a
        // 'disconnect' in the cluster master, and then it will fork
        // a new worker.
        worker.send('graceful:disconnect');
        worker.disconnect();
        console.error('[%s] [graceful:worker:%s] worker disconnect!',
          Date(), process.pid);
      } catch (er2) {
        // Usually, this error throw cause by the active connections after the first domain error,
        // oh well, not much we can do at this point.
        console.error('[%s] [graceful:worker:%s] Error on worker disconnect!\n%s',
          Date(), process.pid, er2.stack);
      }
    }
  });
};

function killChildren(callback) {
  pstree(process.pid, function(err, children) {
    if (err) {
      // if get children error, just ignore it
      console.error('[%s] [graceful:worker:%s] pstree find children error: %s', Date(), process.pid, err);
      callback();
      return;
    }
    children.forEach(function(child) {
      kill(parseInt(child.PID));
    });
    callback();
  });
}

function kill(pid) {
  try {
    process.kill(pid, 'SIGKILL');
  } catch (_) {
    // ignore
  }
}
