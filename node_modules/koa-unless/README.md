# Koa Unless

![Build Status](https://travis-ci.org/Foxandxss/koa-unless.svg?branch=master)

Conditionally skip a middleware when a condition is met.

## Install

	npm i koa-unless --save

## Usage

With existing middlewares:

```javascript
var unless = require('koa-unless');
var serve  = require('koa-static');

var static = serve(__dirname + '/public');
static.unless = unless;

app.use(static.unless({ method: 'OPTIONS' }));
```

If you are authoring a middleware you can support unless as follow:

```javascript
module.exports = function () {
  var mymid = function(ctx, next) {
	// Do something
  };

  mymid.unless = require('koa-unless');

  return mymid;
};
```

## Current options

-  `method` it could be an string or an array of strings. If the request method match the middleware will not run.
-  `path` it could be an string, a regexp or an array of any of those. If the request path match, the middleware will not run.
-  `ext` it could be an string or an array of strings. If the request path ends with one of these extensions the middleware will not run.
-  `custom` it must be a function that returns `true` / `false`. If the function returns true for the given request, ithe middleware will not run. The function will have access to Koa's context via `this`
-  `useOriginalUrl` it should be `true` or `false`, default is `true`. if false, `path` will match against `ctx.url` instead of `ctx.originalUrl`.


## Examples

Require authentication for every request unless the path is index.html.

```javascript
app.use(requiresAuth.unless({ path: ['/index.html', '/'] }))
```

Avoid a fstat for request to routes doesnt end with a given extension.

```javascript
app.use(static.unless(function () {
  var ext = url.parse(this.originalUrl).pathname.substr(-4);
  return !~['.jpg', '.html', '.css', '.js'].indexOf(ext);
}));
```

## Credits

All the credits for this library goes for [José F. Romaniello](https://github.com/jfromaniello) which created the original [express version](https://github.com/jfromaniello/express-unless).

## License

MIT 2015 - Jesús Rodríguez
