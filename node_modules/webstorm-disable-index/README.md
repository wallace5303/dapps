## webstorm-disable-index

Init default webstorm config.

usage:

```
// package.json
"devDependencies": {
  "webstorm-disable-index": "1"
},
"config": {
  "webstorm": {
    // ignore the whole node_modules, but add these as lib
    "index": ["egg", "egg-init"]
  }
}

```


usage2: support sub modules

    // support casade modules parse

Supposing below webstorm project case:

```bash
|--- package.json (root)
|--- node-server
  |-- package.json
|--- static-server
  |-- package.json
|--- static-server2
  |-- package.json
```


You just add dependencies in root package.json, and then all sub modules's node_modules are disabled from the whole project

```
// package.json
"devDependencies": {
  "webstorm-disable-index": "1"
},
"config": {
  "webstorm": {
    "modules": ["node-server", "static-server", "static-server2"]
  }
}

```