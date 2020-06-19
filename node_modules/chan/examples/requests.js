// jshint esnext:true

var request = require('superagent')
var chan    = require('..')
var co      = require('co')

var urls = [
  'http://google.com',
  'http://medium.com',
  'http://segment.io',
  'http://cloudup.com'
]

co(function *() {
  var ch = chan()
  var res

  urls.forEach(function (url) {
    request.get(url, ch)
  })

  while ((res = yield ch)) {
    console.log(res.status)
  }
})()
