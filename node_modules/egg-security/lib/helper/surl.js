'use strict';

const escapeMap = {
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;',
  '\'': '&#x27;',
};

module.exports = function surl(val) {

  // Just get the converted the protocalWhiteList in `Set` mode,
  // Avoid conversions in `foreach`
  const protocolWhiteListSet = this.app.config.security._protocolWhiteListSet;

  if (typeof val !== 'string') return val;

  // only test on absolute path
  if (val[0] !== '/') {
    const arr = val.split('://', 2);
    const protocol = arr.length > 1 ? arr[0].toLowerCase() : '';
    if (protocol === '' || !protocolWhiteListSet.has(protocol)) {
      if (this.app.config.env === 'local') {
        this.ctx.coreLogger.warn('[egg-security:surl] url: %j, protocol: %j, ' +
          'protocol is empty or not in white list, convert to empty string', val, protocol);
      }
      return '';
    }
  }

  return val.replace(/["'<>]/g, function(ch) {
    return escapeMap[ch];
  });
};
