/**
 * Copyright(c) node-modules and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <m@fengmk2.com> (http://fengmk2.com)
 */

"use strict";

/**
 * Module dependencies.
 */

var cluster = require('cluster');

module.exports = reload;

// Windows not support SIGQUIT https://nodejs.org/api/process.html#process_signal_events
var KILL_SIGNAL = 'SIGTERM';
var reloading = false;
var reloadPedding = false;
function reload(count) {
  if (reloading) {
    reloadPedding = true;
    return;
  }
  if (!count) {
    count = require('os').cpus().length;
  }
  reloading = true;
  // find out all alive workers
  var aliveWorkers = [];
  var worker;
  for (var id in cluster.workers) {
    worker = cluster.workers[id];
    if (worker.state === 'disconnected') {
      continue;
    }
    aliveWorkers.push(worker);
  }

  var firstWorker;
  var newWorker;

  function reset() {
    // don't leak
    newWorker.removeListener('listening', reset);
    newWorker.removeListener('error', reset);

    if (firstWorker) {
      // console.log('firstWorker %s %s', firstWorker.id, firstWorker.state);
      firstWorker.kill(KILL_SIGNAL);
      setTimeout(function () {
        firstWorker.process.kill(KILL_SIGNAL);
      }, 100);
    }
    reloading = false;
    if (reloadPedding) {
      // has reload jobs, reload again
      reloadPedding = false;
      reload(count);
    }
  }

  firstWorker = aliveWorkers[0];
  newWorker = cluster.fork();
  newWorker.on('listening', reset).on('exit', reset);

  // kill other workers
  for (var i = 1; i < aliveWorkers.length; i++) {
    worker = aliveWorkers[i];
    // console.log('worker %s %s', worker.id, worker.state);
    worker.kill(KILL_SIGNAL);
  }

  // keep workers number as before
  var left = count - 1;
  for (var j = 0; j < left; j++) {
    cluster.fork();
  }
}
