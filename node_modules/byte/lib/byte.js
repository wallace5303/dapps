'use strict';

const Long = require('long');
const debug = require('debug')('byte');
const numbers = require('./number');
const utility = require('utility');

const DEFAULT_SIZE = 1024;
const BIG_ENDIAN = 1;
const LITTLE_ENDIAN = 2;
const MAX_INT_31 = Math.pow(2, 31);
const ONE_HUNDRED_MB = 100 * 1024 * 1024;

function ByteBuffer(options) {
  options = options || {};
  this._order = options.order || BIG_ENDIAN;
  this._size = options.size || DEFAULT_SIZE;
  this._offset = 0;
  this._limit = this._size;
  const array = options.array;
  if (array) {
    this._bytes = array;
  } else {
    this._bytes = Buffer.alloc(this._size);
  }
}

ByteBuffer.BIG_ENDIAN = BIG_ENDIAN;
ByteBuffer.LITTLE_ENDIAN = LITTLE_ENDIAN;

ByteBuffer.allocate = function(capacity) {
  return new ByteBuffer({ size: capacity });
};

ByteBuffer.wrap = function(array, offset, length) {
  if (offset) {
    const end = offset + (length || array.length);
    array = array.slice(offset, end);
  }
  return new ByteBuffer({ array, size: array.length });
};

ByteBuffer.prototype.reset = function() {
  this._offset = 0;
};

ByteBuffer.prototype.order = function(order) {
  this._order = order;
  return this;
};

ByteBuffer.prototype._checkSize = function(afterSize) {
  if (this._size >= afterSize) {
    return;
  }
  const old = this._size;
  this._size = afterSize * 2;
  this._limit = this._size;
  debug('allocate new Buffer: from %d to %d bytes', old, this._size);
  const bytes = Buffer.alloc(this._size);
  this._bytes.copy(bytes, 0);
  this._bytes = bytes;
};

ByteBuffer.prototype.put = function(src, offset, length) {
  // byte
  // bytes, offset, length
  // index, byte

  if (typeof src !== 'number') {
    // bytes, offset, length
    const index = this._offset;
    offset = offset || 0;
    length = length || src.length;
    this._offset += length;
    this._checkSize(this._offset);
    src.copy(this._bytes, index, offset, offset + length);
    return this;
  }

  if (offset === undefined) {
    // byte
    offset = src;
    src = this._offset;
    this._offset++;
    this._checkSize(this._offset);
  }
  // index, byte
  this._bytes[src] = offset;
  return this;
};

ByteBuffer.prototype.get = function(index, length) {
  if (index == null && length == null) {
    return this._bytes[this._offset++];
  }
  if (typeof index === 'number' && length == null) {
    return this._bytes[index];
  }
  if (typeof index === 'number' && typeof length === 'number') {
    // offset, length => Buffer
    return this._copy(index, index + length);
  }

  const dst = index;
  const offset = length || 0;
  length = dst.length;

  this.checkArraySize(dst.length, offset, length);
  this.checkForUnderflow(length);

  if (Buffer.isBuffer(dst)) {
    this._bytes.copy(dst, offset, this._offset, (this._offset + length));
  } else {
    for (let i = offset; i < (offset + length); i++) {
      dst[i] = this._bytes[i];
    }
  }
  this._offset += length;
  return this;
};

ByteBuffer.prototype.read = function(size) {
  const index = this._offset;
  this._offset += size;
  return this._bytes.slice(index, this._offset);
};

ByteBuffer.prototype.putChar = function(index, value) {
  // char
  // int, char
  if (value === undefined) {
    // char
    value = charCode(index);
    index = this._offset;
    this._offset++;
    this._checkSize(this._offset);
  } else {
    // int, char
    value = charCode(value);
  }
  this._bytes[index] = value;
  return this;
};

function charCode(c) {
  return typeof c === 'string' ? c.charCodeAt(0) : c;
}

ByteBuffer.prototype.getChar = function(index) {
  const b = this.get(index);
  return String.fromCharCode(b);
};

Object.keys(numbers).forEach(function(type) {
  const putMethod = 'put' + type;
  const getMethod = 'get' + type;
  const handles = numbers[type];
  const size = handles.size;

  ByteBuffer.prototype[putMethod] = function(index, value) {
    // index, value
    // value
    if (value === undefined) {
      // index, value
      value = index;
      index = this._offset;
      this._offset += size;
      this._checkSize(this._offset);
    }

    const handle = this._order === BIG_ENDIAN ?
      handles.writeBE :
      handles.writeLE;
    this._bytes[handle](value, index);
    return this;
  };

  ByteBuffer.prototype[getMethod] = function(index) {
    if (typeof index !== 'number') {
      index = this._offset;
      this._offset += size;
    }

    const handle = this._order === BIG_ENDIAN ?
      handles.readBE :
      handles.readLE;
    return this._bytes[handle](index);
  };
});

ByteBuffer.prototype._putZero = function(index) {
  this._bytes[index] = 0;
  this._bytes[index + 1] = 0;
  this._bytes[index + 2] = 0;
  this._bytes[index + 3] = 0;
};

ByteBuffer.prototype._putFF = function(index) {
  this._bytes[index] = 0xff;
  this._bytes[index + 1] = 0xff;
  this._bytes[index + 2] = 0xff;
  this._bytes[index + 3] = 0xff;
};

ByteBuffer.prototype.putLong = function(index, value) {
  // long
  // int, long
  let offset = 0;
  if (value === undefined) {
    // long
    offset = this._offset;
    this._offset += 8;
    this._checkSize(this._offset);
    value = index;
  } else {
    // int, long
    offset = index;
  }

  // get the offset
  let highOffset = offset;
  let lowOffset = offset + 4;
  if (this._order !== BIG_ENDIAN) {
    highOffset = offset + 4;
    lowOffset = offset;
  }

  let isNumber = typeof value === 'number';
  // convert safe number string to number
  if (!isNumber && utility.isSafeNumberString(value)) {
    isNumber = true;
    value = Number(value);
  }

  // int
  if (isNumber &&
    value < MAX_INT_31 &&
    value >= -MAX_INT_31) {
    // put high
    value < 0 ?
      this._putFF(highOffset) :
      this._putZero(highOffset);
    if (this._order === BIG_ENDIAN) {
      this._bytes.writeInt32BE(value, lowOffset);
    } else {
      this._bytes.writeInt32LE(value, lowOffset);
    }
    return this;
  }

  // long number or string, make it a Long Object
  // TODO: Long object's performence has big problem
  if (typeof value.low !== 'number' ||
    typeof value.high !== 'number') {
    // not Long instance, must be Number or String
    value = isNumber ?
      Long.fromNumber(value) :
      Long.fromString(value);
  }

  // write
  if (this._order === BIG_ENDIAN) {
    this._bytes.writeInt32BE(value.high, highOffset);
    this._bytes.writeInt32BE(value.low, lowOffset);
  } else {
    this._bytes.writeInt32LE(value.high, highOffset);
    this._bytes.writeInt32LE(value.low, lowOffset);
  }

  return this;
};

ByteBuffer.prototype.putInt64 = ByteBuffer.prototype.putLong;

ByteBuffer.prototype.getLong = function(index) {
  if (typeof index !== 'number') {
    index = this._offset;
    this._offset += 8;
  }
  if (this._order === BIG_ENDIAN) {
    return new Long(
      this._bytes.readInt32BE(index + 4), // low, high
      this._bytes.readInt32BE(index)
    );
  }
  return new Long(
    this._bytes.readInt32LE(index),
    this._bytes.readInt32LE(index + 4)
  );

};

ByteBuffer.prototype.getInt64 = ByteBuffer.prototype.getLong;

ByteBuffer.prototype._putString = function(index, value, format) {
  if (!value || value.length === 0) {
    // empty string
    if (index === null || index === undefined) {
      index = this._offset;
      this._offset += 4;
      this._checkSize(this._offset);
    } else {
      this._checkSize(index + 4);
    }
    return this.putInt(index, 0);
  }

  const isBuffer = Buffer.isBuffer(value);
  let length = isBuffer ?
    value.length :
    Buffer.byteLength(value);

  if (format === 'c') {
    length++;
  }
  if (index === null || index === undefined) {
    index = this._offset;
    this._offset += length + 4;
    this._checkSize(this._offset);
  } else {
    this._checkSize(index + length + 4);
  }
  this.putInt(index, length);
  const valueOffset = index + 4;

  if (isBuffer) {
    value.copy(this._bytes, valueOffset);
  } else {
    this._bytes.write(value, valueOffset);
  }

  if (format === 'c') {
    this.put(valueOffset + length, 0);
  }

  return this;
};

// Prints a string to the Buffer, encoded as CESU-8
ByteBuffer.prototype.putRawString = function(index, str) {
  if (typeof index === 'string') {
    // putRawString(str)
    str = index;
    index = this._offset;
    // Note that an UTF-8 encoder will encode a character that is outside BMP
    // as 4 bytes, yet a CESU-8 encoder will encode as 6 bytes, ergo 6 / 4 = 1.5
    // @see https://en.wikipedia.org/wiki/CESU-8
    // this._checkSize(this._offset + Math.ceil(Buffer.byteLength(str) * 1.5));

    // use big memory to exchange better performence
    // one char => max bytes is 3
    let maxIncreaseSize = str.length * 3;
    if (maxIncreaseSize > ONE_HUNDRED_MB) {
      maxIncreaseSize = Math.ceil(Buffer.byteLength(str) * 1.5);
    }
    this._checkSize(this._offset + maxIncreaseSize);
  }

  // CESU-8 Bit Distribution
  // @see http://www.unicode.org/reports/tr26/
  //
  // UTF-16 Code Unit                   | 1st Byte               | 2nd Byte               | 3rd Byte
  // 000000000xxxxxxx (0x0000 ~ 0x007f) | 0xxxxxxx (0x00 ~ 0x7f) |                        |
  // 00000yyyyyxxxxxx (0x0080 ~ 0x07ff) | 110yyyyy (0xc0 ~ 0xdf) | 10xxxxxx (0x80 ~ 0xbf) |
  // zzzzyyyyyyxxxxxx (0x0800 ~ 0xffff) | 1110zzzz (0xe0 ~ 0xef) | 10yyyyyy (0x80 ~ 0xbf) | 10xxxxxx (0x80 ~ 0xbf)

  const len = str && str.length;
  if (!len) {
    return this;
  }
  for (let i = 0; i < len; i++) {
    const ch = str.charCodeAt(i);
    // 0x80: 128
    if (ch < 0x80) {
      this._bytes[index++] = ch;
    } else if (ch < 0x800) {
      // 0x800: 2048
      this._bytes[index++] = (0xc0 + ((ch >> 6) & 0x1f)) >>> 32;
      this._bytes[index++] = (0x80 + (ch & 0x3f)) >>> 32;
    } else {
      this._bytes[index++] = (0xe0 + ((ch >> 12) & 0xf)) >>> 32;
      this._bytes[index++] = (0x80 + ((ch >> 6) & 0x3f)) >>> 32;
      this._bytes[index++] = (0x80 + (ch & 0x3f)) >>> 32;
    }
  }
  // index is now probably less than @_offset and reflects the real length
  this._offset = index;
  return this;
};

ByteBuffer.prototype._copy = function(start, end) {
  // magic number here..
  // @see benchmark/buffer_slice_and_copy.js
  // if (end - start > 2048) {
  //   return this._bytes.slice(start, end);
  // }
  const buf = Buffer.alloc(end - start);
  this._bytes.copy(buf, 0, start, end);
  return buf;
};

ByteBuffer.prototype.getRawStringByStringLength = function(index, length) {
  let needUpdateOffset = false;
  if (arguments.length === 1) {
    length = index;
    index = this._offset;
    needUpdateOffset = true;
  }

  const data = [];
  let bufLength = 0;
  while (length--) {
    let pos = index + bufLength;
    const ch = this._bytes[pos];
    if (ch < 0x80) {
      data.push(ch);
      bufLength += 1;
    } else if ((ch & 0xe0) === 0xc0) {
      const ch1 = this._bytes[++pos];
      const v = ((ch & 0x1f) << 6) + (ch1 & 0x3f);
      data.push(v);
      bufLength += 2;
    } else if ((ch & 0xf0) === 0xe0) {
      const ch1 = this._bytes[++pos];
      const ch2 = this._bytes[++pos];
      const v = ((ch & 0x0f) << 12) + ((ch1 & 0x3f) << 6) + (ch2 & 0x3f);
      data.push(v);
      bufLength += 3;
    } else {
      throw new Error('string is not valid UTF-8 encode');
    }
  }
  if (needUpdateOffset) this._offset += bufLength;
  return String.fromCharCode.apply(String, data);
};

ByteBuffer.prototype.getRawString = function(index, length) {
  if (typeof index !== 'number') {
    // getRawString() => current offset char string
    index = this._offset++;
  } else if (typeof length === 'number') {
    const data = [];
    for (let pos = index, end = index + length; pos < end; pos++) {
      const ch = this._bytes[pos];
      if (ch < 0x80) {
        data.push(ch);
      } else if ((ch & 0xe0) === 0xc0) {
        const ch1 = this._bytes[++pos];
        const v = ((ch & 0x1f) << 6) + (ch1 & 0x3f);
        data.push(v);
      } else if ((ch & 0xf0) === 0xe0) {
        const ch1 = this._bytes[++pos];
        const ch2 = this._bytes[++pos];
        const v = ((ch & 0x0f) << 12) + ((ch1 & 0x3f) << 6) + (ch2 & 0x3f);
        data.push(v);
      }
    }
    return String.fromCharCode.apply(String, data);
  }
  return String.fromCharCode(this._bytes[index]);
};

ByteBuffer.prototype.readRawString = function(index, length) {
  if (arguments.length === 2) {
    // readRawString(index, length)
  } else {
    // readRawString(length);
    length = index;
    index = this._offset;
    this._offset += length;
  }
  return this._bytes.toString('utf8', index, index + length);
};

[ 'getString', 'getCString' ].forEach(function(method) {
  ByteBuffer.prototype[method] = function(index) {
    let moveOffset = false;
    if (index === null || index === undefined) {
      index = this._offset;
      moveOffset = true;
    }
    let length = this.getInt(index);
    index += 4;

    if (moveOffset) {
      this._offset += 4 + length;
    }

    if (length === 0) {
      // empty string
      return '';
    }

    if (method === 'getCString') {
      length--;
    }
    return this._bytes.toString('utf8', index, index + length);
  };
});

ByteBuffer.prototype.putString = function(index, value) {
  if (typeof value === 'undefined') {
    value = index;
    index = null;
  }
  return this._putString(index, value, 'java');
};

ByteBuffer.prototype.putCString = function(index, value) {
  if (typeof value === 'undefined') {
    value = index;
    index = null;
  }
  return this._putString(index, value, 'c');
};

ByteBuffer.prototype.toString = function() {
  let s = '<ByteBuffer';
  for (let i = 0; i < this._offset; i++) {
    let c = this._bytes[i].toString('16');
    if (c.length === 1) {
      c = '0' + c;
    }
    s += ' ' + c;
  }
  s += '>';
  return s;
};

ByteBuffer.prototype.copy = ByteBuffer.prototype.array = function(start, end) {
  if (arguments.length === 0) {
    start = 0;
    end = this._offset;
  } else if (arguments.length === 1) {
    end = this._offset;
  }

  if (end > this._offset) {
    end = this._offset;
  }
  return this._copy(start, end);
};

ByteBuffer.prototype.memcpy = function(dest, start, end) {
  if (arguments.length === 1) {
    start = 0;
    end = this._offset;
  } else if (arguments.length === 2) {
    end = this._offset;
  }

  if (end > this._offset) {
    end = this._offset;
  }

  if (end - start > dest.length) {
    end = start + dest.length;
  }

  let j = 0;
  for (let i = start; i < end; i++) {
    dest[j++] = this._bytes[i];
  }

  return end - start;
};

ByteBuffer.prototype.position = function(newPosition) {
  if (typeof newPosition === 'number') {
    this._offset = newPosition;
    // make `bytes.position(1).read();` chain
    return this;
  }
  return this._offset;
};

ByteBuffer.prototype.skip = function(size) {
  this._offset += size;
};

ByteBuffer.prototype.flip = function() {
  // switch to read mode
  this.limit(this.position());
  this.position(0);
  return this;
};

ByteBuffer.prototype.clear = function() {
  this._limit = this._size;
  this._offset = 0;
  this._bytes = Buffer.alloc(this._size);
  return this;
};

ByteBuffer.prototype.limit = function(newLimit) {
  if (typeof newLimit === 'number') {
    if ((newLimit < 0) || (newLimit > this._size)) {
      throw new Error('IllegalArgumentException');
    }
    if (this._offset > newLimit) {
      this._offset = newLimit;
    }
    this._limit = newLimit;
    return this;
  }
  return this._limit;
};

ByteBuffer.prototype.capacity = function() {
  return this._size;
};

ByteBuffer.prototype.remaining = function() {
  return this.limit() - this.position();
};

ByteBuffer.prototype.hasRemaining = function() {
  return this.remaining() > 0;
};

ByteBuffer.prototype.checkArraySize = function(arrayLength, offset, length) {
  if ((offset < 0) || (length < 0) || (arrayLength < length + offset)) {
    throw new Error('IndexOutOfBoundsException');
  }
};

ByteBuffer.prototype.checkForUnderflow = function(length) {
  length = length || 0;
  if (this.remaining() < length) {
    throw new Error('BufferOverflowException');
  }
};

module.exports = ByteBuffer;
