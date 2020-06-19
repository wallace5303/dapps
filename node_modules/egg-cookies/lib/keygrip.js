'use strict';

const debug = require('debug')('egg-cookies:keygrip');
const crypto = require('crypto');
const assert = require('assert');
const constantTimeCompare = require('scmp');

const replacer = {
  '/': '_',
  '+': '-',
  '=': '',
};

// patch from https://github.com/crypto-utils/keygrip

class Keygrip {
  constructor(keys) {
    assert(Array.isArray(keys) && keys.length, 'keys must be provided and should be an array');

    this.keys = keys;
    this.hash = 'sha256';
    this.cipher = 'aes-256-cbc';
  }

  // encrypt a message
  encrypt(data, key) {
    key = key || this.keys[0];
    const cipher = crypto.createCipher(this.cipher, key);
    return crypt(cipher, data);
  }

  // decrypt a single message
  // returns false on bad decrypts
  decrypt(data, key) {
    if (!key) {
      // decrypt every key
      const keys = this.keys;
      for (let i = 0; i < keys.length; i++) {
        const value = this.decrypt(data, keys[i]);
        if (value !== false) return { value, index: i };
      }
      return false;
    }

    try {
      const cipher = crypto.createDecipher(this.cipher, key);
      return crypt(cipher, data);
    } catch (err) {
      debug('crypt error', err.stack);
      return false;
    }
  }

  sign(data, key) {
    // default to the first key
    key = key || this.keys[0];

    return crypto
      .createHmac(this.hash, key)
      .update(data)
      .digest('base64')
      .replace(/\/|\+|=/g, x => replacer[x]);
  }

  verify(data, digest) {
    const keys = this.keys;
    for (let i = 0; i < keys.length; i++) {
      if (constantTimeCompare(Buffer.from(digest), Buffer.from(this.sign(data, keys[i])))) {
        debug('data %s match key %s', data, keys[i]);
        return i;
      }
    }
    return -1;
  }
}

function crypt(cipher, data) {
  const text = cipher.update(data, 'utf8');
  const pad = cipher.final();
  return Buffer.concat([ text, pad ]);
}

module.exports = Keygrip;
