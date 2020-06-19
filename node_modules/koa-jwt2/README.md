# koa-jwt2

[![Build](https://travis-ci.org/okoala/koa-jwt2.png)](http://travis-ci.org/okoala/koa-jwt2)

Koa middleware that validates JsonWebTokens and sets `ctx.state.user`.

This module lets you authenticate HTTP requests using JWT tokens in your Node.js
applications. JWTs are typically used to protect API endpoints, and are
often issued using OpenID Connect.

## Install

    $ npm install koa-jwt2 --save

## Usage

The JWT authentication middleware authenticates callers using a JWT.
If the token is valid, `ctx.state.user` will be set with the JSON object decoded
to be used by later middleware for authorization and access control.

For example,

```javascript
var jwt = require("koa-jwt2");

app.get("/protected", jwt({ secret: "shhhhhhared-secret" }), async function(
  ctx
) {
  if (!ctx.state.user.admin) return (ctx.status = 401);
  ctx.status = 200;
});
```

You can specify audience and/or issuer as well:

```javascript
jwt({
  secret: "shhhhhhared-secret",
  audience: "http://myapi/protected",
  issuer: "http://issuer"
});
```

> If the JWT has an expiration (`exp`), it will be checked.

If you are using a base64 URL-encoded secret, pass a `Buffer` with `base64` encoding as the secret instead of a string:

```javascript
jwt({ secret: new Buffer("shhhhhhared-secret", "base64") });
```

Optionally you can make some paths unprotected as follows:

```javascript
app.use(jwt({ secret: "shhhhhhared-secret" }).unless({ path: ["/token"] }));
```

This is especially useful when applying to multiple routes. In the example above, `path` can be a string, a regexp, or an array of any of those.

> For more details on the `.unless` syntax including additional options, please see [koa-unless](https://github.com/Foxandxss/koa-unless).

This module also support tokens signed with public/private key pairs. Instead of a secret, you can specify a Buffer with the public key

```javascript
var publicKey = fs.readFileSync("/path/to/public.pub");
jwt({ secret: publicKey });
```

By default, the decoded token is attached to `ctx.state.user` but can be configured with the `property` option.

```javascript
jwt({ secret: publicKey, property: "auth" });
```

A custom function for extracting the token from a request can be specified with
the `getToken` option. This is useful if you need to pass the token through a
query parameter or a cookie. You can throw an error in this function and it will
be handled by `koa-jwt2`.

```javascript
app.use(
  jwt({
    secret: "hello world !",
    credentialsRequired: false,
    getToken: function fromHeaderOrQuerystring(ctx) {
      if (
        ctx.headers.authorization &&
        ctx.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        return ctx.headers.authorization.split(" ")[1];
      } else if (ctx.query && ctx.query.token) {
        return ctx.query.token;
      }
      return null;
    }
  })
);
```

### Multi-tenancy

If you are developing an application in which the secret used to sign tokens is not static, you can provide a async function as the `secret` parameter. The function has the signature: `async function(ctx, payload)`:

* `ctx` (`Object`) - The koa `ctx` object.
* `payload` (`Object`) - An object with the JWT claims.

need to return a secret string or promise to use to verify the JWT.

For example, if the secret varies based on the [JWT issuer](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#issDef):

```javascript
const jwt = require("koa-jwt2");
const data = require("./data");
const utilities = require("./utilities");

const secretAsync = async function(ctx, payload) {
  const issuer = payload.iss;

  return new Promise((resolve, reject) => {
    data.getTenantByIdentifier(issuer, function(err, tenant) {
      if (err) {
        return reject(err);
      }
      if (!tenant) {
        reject(new Error("missing_secret"));
      }

      const secret = utilities.decrypt(tenant.secret);
      resolve(secret);
    });
  });
};

app.get("/protected", jwt({ secret: secretCallback }), async function(ctx) {
  if (!ctx.state.user.admin) {
    ctx.throw(401);
  }
  ctx.status = 200;
  ctx.body = "";
});
```

### Revoked tokens

It is possible that some tokens will need to be revoked so they cannot be used any longer. You can provide a function as the `isRevoked` option. The signature of the function is `async function(ctx, payload)`:

* `ctx` (`Object`) - The koa `context` object.
* `payload` (`Object`) - An object with the JWT claims.

For example, if the `(iss, jti)` claim pair is used to identify a JWT:

```javascript
const jwt = require("koa-jwt2");
const data = require("./data");
const utilities = require("./utilities");

const isRevokedAsync = function(req, payload, done) {
  const issuer = payload.iss;
  const tokenId = payload.jti;

  return new Promise((resolve, reject) => {
    data.getRevokedToken(issuer, tokenId, function(err, token) {
      if (err) {
        return reject(err);
      }
      resolve(!!token);
    });
  });
};

app.get(
  "/protected",
  jwt({
    secret: "shhhhhhared-secret",
    isRevoked: isRevokedAsync
  }),
  async function(ctx) {
    if (!ctx.state.user.admin) {
      ctx.throw(401);
    }
    ctx.status = 200;
    ctx.body = "";
  }
);
```

### Error handling

The default behavior is to throw an error when the token is invalid, so you can add your custom logic to manage unauthorized access as follows:

```javascript
app.use(async function(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (err.name === "UnauthorizedError") {
      ctx.status = 401;
      ctx.body = "invalid token...";
    }
  }
});
```

You might want to use this module to identify registered users while still providing access to unregistered users. You
can do this by using the option _credentialsRequired_:

```javascript
app.use(
  jwt({
    secret: "hello world !",
    credentialsRequired: false
  })
);
```

## Related Modules

* [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — JSON Web Token sign and verification

## Tests

    $ npm install
    $ npm test

## Contributors

Check them out [here](https://github.com/okoala/koa-jwt2/graphs/contributors)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
