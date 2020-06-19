/**
 * util-deps.js - The parser for dependencies
 * ref: tests/research/parse-dependencies/test.html
 * ref: https://github.com/seajs/crequire
 */

function parseDependencies(s, replace, includeAsync) {
  if(replace === true) {
    includeAsync = true;
    replace = null;
  }
  if(s.indexOf('require') == -1 && s.indexOf('import') == -1) {
    return replace ? s : [];
  }
  var index = 0, peek, length = s.length, isReg = 1, modName = 0, res = []
  var parentheseState = 0, parentheseStack = []
  var braceState, braceStack = [], isReturn
  var last
  var flag
  var quote
  while(index < length) {
    readch()
    if(isBlank()) {
      if(isReturn && (peek == '\n' || peek == '\r')) {
        braceState = 0
        isReturn = 0
      }
    }
    else if(isQuote()) {
      dealQuote()
      isReg = 1
      isReturn = 0
      braceState = 0
    }
    else if(peek == '/') {
      readch()
      if(peek == '/') {
        index = s.indexOf('\n', index)
        if(index == -1) {
          index = s.length
        }
      }
      else if(peek == '*') {
        var i = s.indexOf('\n', index)
        index = s.indexOf('*/', index)
        if(index == -1) {
          index = length
        }
        else {
          index += 2
        }
        if(isReturn && i != -1 && i < index) {
          braceState = 0
          isReturn = 0
        }
      }
      else if(isReg) {
        dealReg()
        isReg = 0
        isReturn = 0
        braceState = 0
      }
      else {
        index--
        isReg = 1
        isReturn = 0
        braceState = 1
      }
    }
    else if(isWord()) {
      dealWord()
    }
    else if(isNumber()) {
      dealNumber()
      isReturn = 0
      braceState = 0
    }
    else if(peek == '(') {
      parentheseStack.push(parentheseState)
      isReg = 1
      isReturn = 0
      braceState = 1
    }
    else if(peek == ')') {
      isReg = parentheseStack.pop()
      isReturn = 0
      braceState = 0
    }
    else if(peek == '{') {
      if(isReturn) {
        braceState = 1
      }
      braceStack.push(braceState)
      isReturn = 0
      isReg = 1
    }
    else if(peek == '}') {
      braceState = braceStack.pop();
      isReg = !braceState
      isReturn = 0
    }
    else {
      var next = s.charAt(index)
      if(peek == ';') {
        braceState = 0
      }
      else if(peek == '-' && next == '-'
        || peek == '+' && next == '+'
        || peek == '=' && next == '>') {
        braceState = 0
        index++
      }
      else {
        braceState = 1
      }
      isReg = peek != ']'
      isReturn = 0
    }
  }
  return replace ? s : res
  function readch() {
    peek = s.charAt(index++)
  }
  function isBlank() {
    return /\s/.test(peek)
  }
  function isQuote() {
    return peek == '"' || peek == "'"
  }
  function dealQuote() {
    var start = index
    var c = peek
    var end = s.indexOf(c, start)
    if(end == -1) {
      index = length
    }
    else if(s.charAt(end - 1) != '\\') {
      index = end + 1
    }
    else {
      while(index < length) {
        readch()
        if(peek == '\\') {
          index++
        }
        else if(peek == c) {
          break
        }
      }
    }
    if(modName) {
      var d = {
        'string': modName == 2
          ? s.slice(last, index)
          : s.slice(last, s.indexOf(')', index) + 1),
        'path': s.slice(start, index - 1),
        'index': last,
        'flag': flag
      }
      res.push(d)
      if(replace) {
        var rep = replace(d)
        s = s.slice(0, last) + rep + s.slice(last + d.string.length)
        if(rep.length != d.string.length) {
          index = last + rep.length
          length = s.length
        }
      }
      modName = 0
    }
  }
  function dealReg() {
    index--
    while(index < length) {
      readch()
      if(peek == '\\') {
        index++
      }
      else if(peek == '/') {
        break
      }
      else if(peek == '[') {
        while(index < length) {
          readch()
          if(peek == '\\') {
            index++
          }
          else if(peek == ']') {
            break
          }
        }
      }
    }
  }
  function isWord() {
    return /[a-z_$]/i.test(peek)
  }
  function dealWord() {
    var s2 = s.slice(index - 1)
    var r = /^[\w$]+/.exec(s2)[0]
    parentheseState = {
      'if': 1,
      'for': 1,
      'while': 1,
      'with': 1
    }[r]
    isReg = {
      'break': 1,
      'case': 1,
      'continue': 1,
      'debugger': 1,
      'delete': 1,
      'do': 1,
      'else': 1,
      'false': 1,
      'if': 1,
      'in': 1,
      'instanceof': 1,
      'return': 1,
      'typeof': 1,
      'void': 1
    }[r]
    isReturn = r == 'return'
    braceState = {
      'instanceof': 1,
      'delete': 1,
      'void': 1,
      'typeof': 1,
      'return': 1
    }.hasOwnProperty(r)
    if(r == 'require') {
      modName = includeAsync
        ? /^require\s*(?:\/\*[\s\S]*?\*\/\s*)?[.\w$]*\s*(?:\/\*[\s\S]*?\*\/\s*)?\(\s*(['"]).+?\1\s*[),]/.test(s2)
        : /^require\s*(?:\/\*[\s\S]*?\*\/\s*)?\(\s*(['"]).+?\1\s*[),]/.test(s2)
    }
    else if(r == 'import') {
      // ignore `{ import() {} }`
      modName = /^import[^(]*?['"]/.test(s2);
      if (modName) modName = 2;
    }
    if(modName) {
      last = index - 1
      if(r == 'require') {
        r = includeAsync
          ? /^require\s*(?:\/\*[\s\S]*?\*\/\s*)?[.\w$]*\s*(?:\/\*[\s\S]*?\*\/\s*)?\(\s*['"]/.exec(s2)[0]
          : /^require\s*(?:\/\*[\s\S]*?\*\/\s*)?\(\s*['"]/.exec(s2)[0]
        index += r.length - 2
        flag = /^require\s*(?:\/\*[\s\S]*?\*\/\s*)?([.\w$]+)/.test(s2)
          ? /^require\s*(?:\/\*[\s\S]*?\*\/\s*)?([.\w$]+)/.exec(s2)[1]
          : null
      }
      else if (r === 'import') {
        r = /^import[^(]*?['"]/.exec(s2)[0];
        index += r.length - 2
        quote = r.charAt(r.length - 1)
      }
    }
    else {
      index += /^[\w$]+(?:\s*\.\s*[\w$]+)*/.exec(s2)[0].length - 1
    }
  }
  function isNumber() {
    return /\d/.test(peek)
      || peek == '.' && /\d/.test(s.charAt(index))
  }
  function dealNumber() {
    var s2 = s.slice(index - 1)
    var r
    if(peek == '.') {
      r = /^\.\d+(?:E[+-]?\d*)?\s*/i.exec(s2)[0]
    }
    else if(/^0x[\da-f]*/i.test(s2)) {
      r = /^0x[\da-f]*\s*/i.exec(s2)[0]
    }
    else {
      r = /^\d+\.?\d*(?:E[+-]?\d*)?\s*/i.exec(s2)[0]
    }
    index += r.length - 1
    isReg = 0
  }
}

module.exports = parseDependencies
