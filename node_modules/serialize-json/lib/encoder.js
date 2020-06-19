'use strict';

const debug = require('debug')('serialize-json#JSONEncoder');
const is = require('is-type-of');
const utility = require('utility');

const REG_STR_REPLACER = /[\+ \|\^\%]/g;
const ENCODER_REPLACER = {
  ' ': '+',
  '+': '%2B',
  '|': '%7C',
  '^': '%5E',
  '%': '%25',
};

const TOKEN_TRUE = -1;
const TOKEN_FALSE = -2;
const TOKEN_NULL = -3;
const TOKEN_EMPTY_STRING = -4;
const TOKEN_UNDEFINED = -5;

class JSONEncoder {
  constructor() {
    this.dictionary = null;
  }

  encode(json) {
    this.dictionary = {
      strings: [],
      integers: [],
      floats: [],
      dates: [],
    };
    const ast = this._buildAst(json);

    let packed = this.dictionary.strings.join('|');
    packed += `^${this.dictionary.integers.join('|')}`;
    packed += `^${this.dictionary.floats.join('|')}`;
    packed += `^${this.dictionary.dates.join('|')}`;
    packed += `^${this._pack(ast)}`;

    debug('pack the json => %s', packed);
    return Buffer.from(packed);
  }

  _pack(ast) {
    if (is.array(ast)) {
      let packed = ast.shift();
      for (const item of ast) {
        packed += `${this._pack(item)}|`;
      }
      return (packed[packed.length - 1] === '|' ? packed.slice(0, -1) : packed) + ']';
    }
    const type = ast.type;
    const index = ast.index;
    const dictionary = this.dictionary;
    const strLen = dictionary.strings.length;
    const intLen = dictionary.integers.length;
    const floatLen = dictionary.floats.length;

    switch (type) {
      case 'string':
        return this._base10To36(index);
      case 'integer':
        return this._base10To36(strLen + index);
      case 'float':
        return this._base10To36(strLen + intLen + index);
      case 'date':
        return this._base10To36(strLen + intLen + floatLen + index);
      default:
        return this._base10To36(index);
    }
  }

  _encodeString(str) {
    return str.replace(REG_STR_REPLACER, a => ENCODER_REPLACER[a]);
  }

  _base10To36(num) {
    return num.toString(36).toUpperCase();
  }

  _dateTo36(date) {
    return this._base10To36(date.getTime());
  }

  _buildStringAst(str) {
    const dictionary = this.dictionary;
    if (str === '') {
      return {
        type: 'empty',
        index: TOKEN_EMPTY_STRING,
      };
    }
    const data = this._encodeString(str);
    return {
      type: 'string',
      index: dictionary.strings.push(data) - 1,
    };
  }

  _buildNumberAst(num) {
    const dictionary = this.dictionary;
    // integer
    if (num % 1 === 0) {
      const data = this._base10To36(num);
      return {
        type: 'integer',
        index: dictionary.integers.push(data) - 1,
      };
    }
    // float
    return {
      type: 'float',
      index: dictionary.floats.push(num) - 1,
    };
  }

  _buildObjectAst(obj) {
    if (obj === null) {
      return {
        type: 'null',
        index: TOKEN_NULL,
      };
    }
    if (is.date(obj)) {
      const dictionary = this.dictionary;
      const data = this._dateTo36(obj);
      return {
        type: 'date',
        index: dictionary.dates.push(data) - 1,
      };
    }
    let ast;
    if (is.array(obj)) {
      ast = [ '@' ];
      for (const item of obj) {
        ast.push(this._buildAst(item));
      }
      return ast;
    }
    if (is.buffer(obj)) {
      ast = [ '*' ];
      for (const item of obj.values()) {
        ast.push(this._buildAst(item));
      }
      return ast;
    }
    if (is.error(obj)) {
      ast = [ '#' ];
      ast.push(this._buildAst('message'));
      ast.push(this._buildAst(obj.message));
      ast.push(this._buildAst('stack'));
      ast.push(this._buildAst(obj.stack));
    } else {
      ast = [ '$' ];
    }
    for (const key in obj) {
      // support object without prototype, like: Object.create(null)
      if (!utility.has(obj, key)) {
        continue;
      }
      ast.push(this._buildAst(key));
      ast.push(this._buildAst(obj[key]));
    }
    return ast;
  }

  _buildAst(item) {
    const type = typeof item;
    debug('calling buildAst with type: %s and data: %j', type, item);

    switch (type) {
      case 'string':
        return this._buildStringAst(item);
      case 'number':
        return this._buildNumberAst(item);
      case 'boolean':
        return {
          type: 'boolean',
          index: item ? TOKEN_TRUE : TOKEN_FALSE,
        };
      case 'undefined':
        return {
          type: 'undefined',
          index: TOKEN_UNDEFINED,
        };
      case 'object':
        return this._buildObjectAst(item);
      default:
        debug('unsupported type: %s, return null', type);
        return {
          type: 'null',
          index: TOKEN_NULL,
        };
    }
  }
}

module.exports = JSONEncoder;
