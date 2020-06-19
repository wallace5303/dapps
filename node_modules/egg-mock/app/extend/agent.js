'use strict';
const mm = require('mm');
const mockHttpclient = require('../../lib/mock_httpclient');

module.exports = {

  /**
   * mock httpclient
   * @function Agent#mockHttpclient
   * @param {...any} args - args
   * @return {Context} this
   */
  mockHttpclient(...args) {
    if (!this._mockHttpclient) {
      this._mockHttpclient = mockHttpclient(this);
    }
    return this._mockHttpclient(...args);
  },

  /**
   * @see mm#restore
   * @function Agent#mockRestore
   */
  mockRestore: mm.restore,

  /**
   * @see mm
   * @function Agent#mm
   */
  mm,
};
