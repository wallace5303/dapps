const jwt = require("jsonwebtoken");
const UnauthorizedError = require("./errors/UnauthorizedError");
const unless = require("koa-unless");
const async = require("async");
const set = require("lodash.set");
const isFunction = require("lodash.isfunction");

const wrapIsRevokedInAsync = isRevoked => {
  return async function(_, __) {
    return isRevoked || false;
  };
};

function wrapStaticSecretInAsync(secret) {
  return async function(_, __) {
    return secret;
  };
}

module.exports = function(options) {
  if (!options || !options.secret) throw new Error("secret should be set");

  let secretAsync = options.secret;

  if (!isFunction(secretAsync)) {
    secretAsync = wrapStaticSecretInAsync(secretAsync);
  }

  let isRevokedAsync = options.isRevoked;
  if (!isFunction(isRevokedAsync)) {
    isRevokedAsync = wrapIsRevokedInAsync(isRevokedAsync);
  }

  const property = options.property || options.userProperty || "user";
  const credentialsRequired =
    typeof options.credentialsRequired === "undefined"
      ? true
      : options.credentialsRequired;

  const middleware = async function(ctx, next) {
    let token;

    if (ctx.method === "OPTIONS" && ctx.get("access-control-request-headers")) {
      const hasAuthInAccessControl = !!~ctx
        .get("access-control-request-headers")
        .split(",")
        .map(function(header) {
          return header.trim();
        })
        .indexOf("authorization");

      if (hasAuthInAccessControl) {
        return await next();
      }
    }

    if (options.getToken && typeof options.getToken === "function") {
      try {
        token = options.getToken(ctx);
      } catch (e) {
        throw e;
      }
    } else if (ctx.get("authorization")) {
      const parts = ctx.get("authorization").split(" ");
      if (parts.length == 2) {
        const scheme = parts[0];
        const credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        } else {
          if (credentialsRequired) {
            throw new UnauthorizedError("credentials_bad_scheme", {
              message: "Format is Authorization: Bearer [token]"
            });
          } else {
            return await next();
          }
        }
      } else {
        throw new UnauthorizedError("credentials_bad_format", {
          message: "Format is Authorization: Bearer [token]"
        });
      }
    }

    if (!token) {
      if (credentialsRequired) {
        throw new UnauthorizedError("credentials_required", {
          message: "No authorization token was found"
        });
      } else {
        return await next();
      }
    }

    let dtoken;

    try {
      dtoken = jwt.decode(token, { complete: true }) || {};
    } catch (err) {
      throw new UnauthorizedError("invalid_token", err);
    }

    const arity = secretAsync.length;
    let secret;
    if (arity == 4) {
      secret = await secretAsync(ctx, dtoken.header, dtoken.payload);
    } else {
      // arity == 3
      secret = await secretAsync(ctx, dtoken.payload);
    }

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, secret, options, function(err, decoded) {
        if (err) {
          reject(new UnauthorizedError("invalid_token", err));
        } else {
          resolve(decoded);
        }
      });
    });

    const result = await new Promise(async (resolve, reject) => {
      let revoked;
      try {
        revoked = await isRevokedAsync(ctx, dtoken.payload);
      } catch (err) {
        reject(err);
      }

      if (revoked) {
        reject(
          new UnauthorizedError("revoked_token", {
            message: "The token has been revoked."
          })
        );
      } else {
        resolve(decoded);
      }
    });

    set(ctx.state, property, result);

    await next();
  };

  middleware.unless = unless;
  middleware.UnauthorizedError = UnauthorizedError;

  return middleware;
};

module.exports.UnauthorizedError = UnauthorizedError;
