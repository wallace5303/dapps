  print array as a table into console.   

## Install
```
npm install printable
```

## Usage
```
/**
 * print [['helloworld', '你好'], ['hello', 'world']] =>
 * helloworld  你好
 * hello       world
 * @param  {Array} lines    source array
 * @param  {String|Number}  string border or length of space border
 * @param  {Number} max     each word max length
 * @return {String}         
 */
pt.print(lines, border, max);
```

```
var pt = require('printable');
var source = [['hello', 'world'], ['你好', '世界'], ['foo', 'bar']];
pt.print(source, ' | ');
// hello | world
// 你好  | 世界
// foo   | bar

pt.print(source, 1, 4);
//hell worl
//你好 世界
//foo  bar 
```
## License
MIT
