'use strict';

const cluster = require('cluster');
const sendmessage = require('sendmessage');
const debug = require('debug')('egg-cluster:messenger');


/**
 * master messenger,provide communication between parent, master, agent and app.
 *
 *             ┌────────┐
 *             │ parent │
 *            /└────────┘\
 *           /     |      \
 *          /  ┌────────┐  \
 *         /   │ master │   \
 *        /    └────────┘    \
 *       /     /         \    \
 *     ┌───────┐         ┌───────┐
 *     │ agent │ ------- │  app  │
 *     └───────┘         └───────┘
 *
 *
 * in app worker
 *
 * ```js
 * process.send({
 *   action: 'xxx',
 *   data: '',
 *   to: 'agent/master/parent', // default to app
 * });
 * ```
 *
 * in agent worker
 *
 * ```js
 * process.send({
 *   action: 'xxx',
 *   data: '',
 *   to: 'app/master/parent', // default to agent
 * });
 * ```
 *
 * in parent
 *
 * ```js
 * process.send({
 *   action: 'xxx',
 *   data: '',
 *   to: 'app/agent/master', // default to be ignore
 * });
 * ```
 */
class Messenger {

  constructor(master) {
    this.master = master;
    this.hasParent = !!process.send;
    process.on('message', msg => {
      msg.from = 'parent';
      this.send(msg);
    });
    process.once('disconnect', () => {
      this.hasParent = false;
    });
  }

  /**
   * send message
   * @param {Object} data message body
   *  - {String} from from who
   *  - {String} to to who
   */
  send(data) {
    if (!data.from) {
      data.from = 'master';
    }

    // recognise receiverPid is to who
    if (data.receiverPid) {
      if (data.receiverPid === String(process.pid)) {
        data.to = 'master';
      } else if (data.receiverPid === String(this.master.agentWorker.pid)) {
        data.to = 'agent';
      } else {
        data.to = 'app';
      }
    }

    // default from -> to rules
    if (!data.to) {
      if (data.from === 'agent') data.to = 'app';
      if (data.from === 'app') data.to = 'agent';
      if (data.from === 'parent') data.to = 'master';
    }

    // app -> master
    // agent -> master
    if (data.to === 'master') {
      debug('%s -> master, data: %j', data.from, data);
      // app/agent to master
      this.sendToMaster(data);
      return;
    }

    // master -> parent
    // app -> parent
    // agent -> parent
    if (data.to === 'parent') {
      debug('%s -> parent, data: %j', data.from, data);
      this.sendToParent(data);
      return;
    }

    // parent -> master -> app
    // agent -> master -> app
    if (data.to === 'app') {
      debug('%s -> %s, data: %j', data.from, data.to, data);
      this.sendToAppWorker(data);
      return;
    }

    // parent -> master -> agent
    // app -> master -> agent，可能不指定 to
    if (data.to === 'agent') {
      debug('%s -> %s, data: %j', data.from, data.to, data);
      this.sendToAgentWorker(data);
      return;
    }
  }

  /**
   * send message to master self
   * @param {Object} data message body
   */
  sendToMaster(data) {
    this.master.emit(data.action, data.data);
  }

  /**
   * send message to parent process
   * @param {Object} data message body
   */
  sendToParent(data) {
    if (!this.hasParent) {
      return;
    }
    process.send(data);
  }

  /**
   * send message to app worker
   * @param {Object} data message body
   */
  sendToAppWorker(data) {
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      if (worker.state === 'disconnected') {
        continue;
      }
      // check receiverPid
      if (data.receiverPid && data.receiverPid !== String(worker.process.pid)) {
        continue;
      }
      sendmessage(worker, data);
    }
  }

  /**
   * send message to agent worker
   * @param {Object} data message body
   */
  sendToAgentWorker(data) {
    if (this.master.agentWorker) {
      sendmessage(this.master.agentWorker, data);
    }
  }

}

module.exports = Messenger;
