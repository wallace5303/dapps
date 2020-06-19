'use strict';

module.exports = mod => {
  const wrapped = (args1, args2, args3, args4) => {
    // arrow function can't bind arguments, and can't use rest in node@4, sign
    const args = [ args1, args2, args3, args4 ];
    for (let i = args.length - 1; i >= 0; i--) {
      if (args[i] !== undefined) break;
      args.pop();
    }

    return new Promise((resolve, reject) => {
      args.push(function mZmodulesWrapCallback(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
      mod.apply(null, args);
    });
  };

  for (const key in mod) {
    wrapped[key] = mod[key];
  }

  return wrapped;
};
