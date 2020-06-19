'use strict';

const path = require('path');

// judge if parent is child's parent path
// isEqualOrParentPath('/foo', '/foo/bar') => true
// isEqualOrParentPath('/foo/bar', '/foo') => false
exports.isEqualOrParentPath = function(parent, child) {
  return !path.relative(parent, child).startsWith('..');
};
