## black-hole-stream

A Stream which silently drops all incoming data similar to /dev/null on linux/unix

## Installation
`npm install black-hole-stream`

## Usage

```javascript
var BlackHoleStream = require("black-hole-stream");

var blackHoleStream = new BlackHoleStream();

rs.pipe(blackHoleStream);
```

