# egg-schedule

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-schedule.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-schedule
[travis-image]: https://img.shields.io/travis/eggjs/egg-schedule.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-schedule
[codecov-image]: https://codecov.io/github/eggjs/egg-schedule/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-schedule?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-schedule.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-schedule
[snyk-image]: https://snyk.io/test/npm/egg-schedule/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-schedule
[download-image]: https://img.shields.io/npm/dm/egg-schedule.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-schedule

A schedule plugin for egg, has been built-in plugin for egg enabled by default.

It's fully extendable for developer and provide a simple built-in TimerStrategy.

## Usage

Just add you job file to `{app_root}/app/schedule`.

```js
// {app_root}/app/schedule/cleandb.js
const Subscription = require('egg').Subscription;

class CleanDB extends Subscription {
  /**
   * @property {Object} schedule
   *  - {String} type - schedule type, `worker` or `all` or your custom types.
   *  - {String} [cron] - cron expression, see [below](#cron-style-scheduling)
   *  - {Object} [cronOptions] - cron options, see [cron-parser#options](https://github.com/harrisiirak/cron-parser#options)
   *  - {String | Number} [interval] - interval expression in millisecond or express explicitly like '1h'. see [below](#interval-style-scheduling)
   *  - {Boolean} [immediate] - To run a scheduler at startup
   *  - {Boolean} [disable] - whether to disable a scheduler, usually use in dynamic schedule
   *  - {Array} [env] - only enable scheduler when match env list
   */
  static get schedule() {
    return {
      type: 'worker',
      cron: '0 0 3 * * *',
      // interval: '1h',
      // immediate: true,
    };
  }

  async subscribe() {
    await this.ctx.service.db.cleandb();
  }
}

module.exports = CleanDB;
```

You can also use function simply.

```js
exports.schedule = {
  type: 'worker',
  cron: '0 0 3 * * *',
  // interval: '1h',
  // immediate: true,
};

exports.task = async function (ctx) {
  await ctx.service.db.cleandb();
};
```

## Overview

`egg-schedule` supports both cron-based scheduling and interval-based scheduling.

Schedule decision is being made by `agent` process. `agent` triggers a task and sends message to `worker` process. Then, one or all `worker` process(es) execute the task based on schedule type.

To setup a schedule task, simply create a job file in `{app_root}/app/schedule`. A file contains one job and export `schedule` and `task` properties.

The rule of thumbs is one job per file.

## Task

Task is a class which will be instantiated every schedule, and `subscribe` method will be invoked.

You can get anonymous context with `this.ctx`.

- ctx.method: `SCHEDULE`
- ctx.path: `/__schedule?path=${schedulePath}&${schedule}`.

To create a task, `subscribe` can be generator function or async function. For example:

```js
// A simple logger example
const Subscription = require('egg').Subscription;
class LoggerExample extends Subscription {
  async subscribe() {
    this.ctx.logger.info('Info about your task');
  }
}
```

```js
// A real world example: wipe out your database.
// Use it with caution. :)
const Subscription = require('egg').Subscription;
class CleanDB extends Subscription {
  async subscribe() {
    await this.ctx.service.db.cleandb();
  }
}
```

## Scheduling

`schedule` is an object that contains one required property, `type`, and optional properties, `{ cron, cronOptions, interval, immediate, disable, env }`.

### Cron-style Scheduling

Use [cron-parser](https://github.com/harrisiirak/cron-parser).

> Note: `cron-parser` support `second` as optional that is not supported by linux crontab.
>
> `@hourly / @daily / @weekly / @monthly / @yearly` is also supported.

```bash
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)
```

Example:

```js
// To execute task every 3 hours
exports.schedule = {
  type: 'worker',
  cron: '0 0 */3 * * *',
  cronOptions: {
    // tz: 'Europe/Athens',
  }
};
```

### Interval-style Scheduling

To use `setInterval`, and support [ms](https://www.npmjs.com/package/ms) conversion style

Example:

```js
// To execute task every 3 hours
exports.schedule = {
  type: 'worker',
  interval: '3h',
};
```

**Notice: Egg built-in TimerStrategy will schedule each execution at a fix rate, regardless of its execution time. So you have to make sure that your actual execution time of your `task/subscribe` must be smaller than your delay time.**

### Schedule Type

**Build-in support is:**

- `worker`: will be executed in one random worker when schedule run.
- `all`: will be executed in all workers when schedule run.

**Custom schedule:**

To create a custom schedule, simply extend `agent.ScheduleStrategy` and register it by `agent.schedule.use(type, clz)`.
You can schedule the task to be executed by one random worker or all workers with the built-in method `this.sendOne(...args)` or `this.sendAll(...args)` which support params, it will pass to `subscribe(...args)` or `task(ctx, ...args)`.

```js
// {app_root}/agent.js
module.exports = function(agent) {
  class CustomStrategy extends agent.ScheduleStrategy {
    start() {
      // such as mq / redis subscribe
      agent.notify.subscribe('remote_task', data => {
        this.sendOne(data);
      });
    }
  }
  agent.schedule.use('custsom', CustomStrategy);
};
```

Then you could use it to defined your job:

```js
// {app_root}/app/schedule/other.js
const Subscription = require('egg').Subscription;
class ClusterTask extends Subscription {
  static get schedule() {
    return {
      type: 'custom',
    };
  }
  async subscribe(data) {
    console.log('got custom data:', data);
    await this.ctx.service.someTask.run();
  }
}
```

## Dynamic schedule

```js
// {app_root}/app/schedule/sync.js
module.exports = app => {
  class SyncTask extends app.Subscription {
    static get schedule() {
      return {
        interval: 10000,
        type: 'worker',
        // only start task when hostname match
        disable: require('os').hostname() !== app.config.sync.hostname,
        // only start task at prod mode
        env: [ 'prod' ],
      };
    }
    async subscribe() {
      await this.ctx.sync();
    }
  }
  return SyncTask;
}
```

## Configuration

### Logging

See `${appInfo.root}/logs/{app_name}/egg-schedule.log` which provided by [config.customLogger.scheduleLogger](https://github.com/eggjs/egg-schedule/blob/master/config/config.default.js).

```js
// config/config.default.js
config.customLogger = {
  scheduleLogger: {
    // consoleLevel: 'NONE',
    // file: path.join(appInfo.root, 'logs', appInfo.name, 'egg-schedule.log'),
  },
};
```

### Customize directory

If you want to add additional schedule directories, you can use this config.

```js
// config/config.default.js
config.schedule = {
  directory: [
    path.join(__dirname, '../app/otherSchedule'),
  ],
};
```

## Testing

`app.runSchedule(scheduleName)` is provided by `egg-schedule` plugin only for test purpose.

Example:

```js
it('test a schedule task', async function () {
  // get app instance
  await app.runSchedule('clean_cache');
});
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](https://github.com/eggjs/egg-schedule/blob/master/LICENSE)
