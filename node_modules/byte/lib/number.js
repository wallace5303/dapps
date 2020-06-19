'use strict';

// put / get number types
module.exports = {
  Double: {
    size: 8,
    writeBE: 'writeDoubleBE',
    writeLE: 'writeDoubleLE',
    readBE: 'readDoubleBE',
    readLE: 'readDoubleLE',
  },
  Float: {
    size: 4,
    writeBE: 'writeFloatBE',
    writeLE: 'writeFloatLE',
    readBE: 'readFloatBE',
    readLE: 'readFloatLE',
  },
  Int8: {
    size: 1,
    writeBE: 'writeInt8',
    writeLE: 'writeInt8',
    readBE: 'readInt8',
    readLE: 'readInt8',
  },
  UInt8: {
    size: 1,
    writeBE: 'writeUInt8',
    writeLE: 'writeUInt8',
    readBE: 'readUInt8',
    readLE: 'readUInt8',
  },
  Short: {
    size: 2,
    writeBE: 'writeInt16BE',
    writeLE: 'writeInt16LE',
    readBE: 'readInt16BE',
    readLE: 'readInt16LE',
  },
  Int16: {
    size: 2,
    writeBE: 'writeInt16BE',
    writeLE: 'writeInt16LE',
    readBE: 'readInt16BE',
    readLE: 'readInt16LE',
  },
  UInt16: {
    size: 2,
    writeBE: 'writeUInt16BE',
    writeLE: 'writeUInt16LE',
    readBE: 'readUInt16BE',
    readLE: 'readUInt16LE',
  },
  Int: {
    size: 4,
    writeBE: 'writeInt32BE',
    writeLE: 'writeInt32LE',
    readBE: 'readInt32BE',
    readLE: 'readInt32LE',
  },
  UInt: {
    size: 4,
    writeBE: 'writeUInt32BE',
    writeLE: 'writeUInt32LE',
    readBE: 'readUInt32BE',
    readLE: 'readUInt32LE',
  },
  Int32: {
    size: 4,
    writeBE: 'writeInt32BE',
    writeLE: 'writeInt32LE',
    readBE: 'readInt32BE',
    readLE: 'readInt32LE',
  },
  UInt32: {
    size: 4,
    writeBE: 'writeUInt32BE',
    writeLE: 'writeUInt32LE',
    readBE: 'readUInt32BE',
    readLE: 'readUInt32LE',
  },
};
