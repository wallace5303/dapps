'use strict';

const path = require('path');

/**
 * watcher options
 * @member Config#watcher
 * @property {string} type - event source type
 */
exports.watcher = {
  type: 'default', // default event source
  eventSources: {
    default: path.join(__dirname, '..', 'lib', 'event-sources', 'default'),
    development: path.join(__dirname, '..', 'lib', 'event-sources', 'development'),
  },
};
