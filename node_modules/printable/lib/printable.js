/*!
 * fprint - lib/fprint.js
 * Copyright(c) 2012 dead_horse<dead_horse@qq.com>
 */



/**
 * print [['helloworld', '你好'], ['hello', 'world']] =>
 * helloworld  你好
 * hello       world
 * @param  {Array} lines    source array
 * @param  {String|Number}  string border or length of space border
 * @param  {Number} max     each word max length
 * @return {String}         
 */
exports.print = function(lines, border, max) {
  border = border || 3;
  var eachMax = max ? [] : _getMax(lines);
  var result = [];
  if (typeof border === 'number') {
    border = _wrapSpace('', border);
  }
  for (var i = 0, ls = lines.length; i < ls; i++) {
    var line = lines[i];
    var words = new Array(line.length);
    for (var j = 0, l = line.length; j < l; j++) {
      words[j] = _wrapSpace(line[j], eachMax[j] || max);
    }
    result.push(words.join(border));
  }
  return result.join('\n');
}

/**
 * make words have a length of max.
 * example:
 * ```
 * _wrapSpace('hello', 7); // 'hello  '
 * _wrapSpace('hello', 3); // 'hel'
 * ```
 * @param  {String} word input word
 * @param  {Number} max  max length
 * @return {String}      ouput word
 */
var _wrapSpace = function(word, max) {
  if (typeof word !== 'string') {
    word = JSON.stringify(word);
  }
  var length = _getLength(word);
  if (length < max) {
    for (var i = length; i < max; i++) {
      word += ' ';
    }
    return word;
  } else {
    return _slice(word, 0, max);
  }
}

/**
 * slice word, make chinese symblos have length of 2
 * example:
 * ```
 * slice('abcd', 0, 3); // 'abc'
 * slice('中国', 0, 3); // '中 '
 * ```
 * @param  {String} str   
 * @param  {Number} start 
 * @param  {Number} max   
 * @return {String}       
 */
function _slice(str, start, max) {
  var length = max;
  var tmp = str.slice(start, length);
  var realLength = _getLength(tmp);
  while(realLength > max) {
    tmp = str.slice(start, --length);
    realLength = _getLength(tmp);
  }
  if (realLength < max) {
    tmp += ' ';
  }
  return tmp;
}

/**
 * get each column's max length
 * example:
 * ```
 * _getMax([['hello', 'world'], ['for', 'bar']]); // [4, 4]
 * ```
 * @param  {Array} lines 
 * @return {Array}       
 */
var _getMax = function(lines) {
  var eachMax = [];
  for (var i = 0, ls = lines.length; i < ls; i++) {
    var line = lines[i];
    for (var j = 0, l = line.length; j < l; j++) {
      var word = line[j];
      var wordLength = typeof word === 'string' ? word.length : JSON.stringify(word).length;
      if (eachMax[j] === undefined || wordLength > eachMax[j]) {
        eachMax[j] = wordLength;
      }
    }
  } 
  return eachMax;
}

/**
 * get display length of string
 * @param  {String} str input string
 * @return {String}     output string
 */
function _getLength(str) {
  return Math.round(str.replace(/[^\x00-\xff]/g, 'qq').length);
}

