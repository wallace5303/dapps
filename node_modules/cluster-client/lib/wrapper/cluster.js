'use strict';

const debug = require('debug')('cluster-client');
const Base = require('./base');
const Leader = require('../leader');
const Follower = require('../follower');
const ClusterServer = require('../server');

// Symbol
const {
  init,
  logger,
  isReady,
  innerClient,
  createClient,
  closeHandler,
} = require('../symbol');

class ClusterClient extends Base {
  constructor(options) {
    super(options);

    this[closeHandler] = () => {
      this[logger].warn('[ClusterClient:%s] %s closed, and try to init it again', this.options.name, this[innerClient].isLeader ? 'leader' : 'follower');
      this[isReady] = false;
      this.ready(false);
      this[init]().catch(err => { this.ready(err); });
    };
  }

  async [createClient]() {
    const name = this.options.name;
    const port = this.options.port;
    let server;
    if (this.options.isLeader === true) {
      server = await ClusterServer.create(name, port);
      if (!server) {
        throw new Error(`create "${name}" leader failed, the port:${port} is occupied by other`);
      }
    } else if (this.options.isLeader === false) {
      // wait for leader active
      await ClusterServer.waitFor(port, this.options.maxWaitTime);
    } else {
      debug('[ClusterClient:%s] init cluster client, try to seize the leader on port:%d', name, port);
      server = await ClusterServer.create(name, port);
    }

    if (server) {
      debug('[ClusterClient:%s] has seized port %d, and serves as leader client.', name, port);
      return new Leader(Object.assign({ server }, this.options));
    }
    debug('[ClusterClient:%s] gives up seizing port %d, and serves as follower client.', name, port);
    return new Follower(this.options);
  }
}

module.exports = ClusterClient;
