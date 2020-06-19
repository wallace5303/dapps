'use strict';

const sjs = require('./sjs');

/**
 * escape json
 * for output json in script
 */

function sanitizeKey(obj) {
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj;
  if (obj === null) return null;
  if (obj instanceof Boolean) return obj;
  if (obj instanceof Number) return obj;
  if (obj instanceof Buffer) return obj.toString();
  for (const k in obj) {
    const escapedK = sjs(k);
    if (escapedK !== k) {
      obj[escapedK] = sanitizeKey(obj[k]);
      obj[k] = undefined;
    } else {
      obj[k] = sanitizeKey(obj[k]);
    }
  }
  return obj;
}

function jsonEscape(obj) {
  return JSON.stringify(sanitizeKey(obj), function(k, v) {
    if (typeof v === 'string') {
      return sjs(v);
    }
    return v;
  });
}

module.exports = jsonEscape;
