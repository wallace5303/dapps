# should-send-same-site-none

The module comes with:

- A small **utility function** `isSameSiteNoneCompatible` for detecting incompatible user agents (browsers) for the `SameSite=None` cookie attribute.

- A **Express middleware** `shouldSendSameSiteNone` for automatically removing `SameSite=None` from response header when reqesting client is incompatible with `SameSite=None`. (Note: You are still responsible for adding the 'Secure' cookie attribute whenever applicable.)

## Background

With Chrome 80 in February 2020, Chrome will treat cookies that have no declared SameSite value as `SameSite=Lax` cookies. Other browser vendors are expected to follow Google’s lead. (See this [Blog Post](https://blog.chromium.org/2019/10/developers-get-ready-for-new.html)).

If you manage cross-site cookies, you will need to apply the SameSite=None; Secure setting to those cookies. However, some browsers, including some versions of Chrome, Safari and UC Browser, might handle the None value in unintended ways, requiring developers to code exceptions for those clients.

`isSameSiteNoneCompatible` utility function detects incompatible user agents based on a [list of known incompatible clients](https://www.chromium.org/updates/same-site/incompatible-clients) and returns `true` if the given user-agent string is compatible with `SameSite=None` cookie attribute.

For Express.js, `shouldSendSameSiteNone` middleware automatically removes `SameSite=None` from set-cookie response header when the reqesting client is incompatible with `SameSite=None`.

## Usage

#### Function: `isSameSiteNoneCompatible`

```

import { isSameSiteNoneCompatible } from 'should-send-same-site-none';

const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) ....';

if (isSameSiteNoneCompatible(ua)) {
	console.log("Yes, the browser is compatible and we can set SameSite=None cookies");
}


```

#### Middleware: `shouldSendSameSiteNone`

```
const express = require('express');
const { shouldSendSameSiteNone } = require('should-send-same-site-none');
const app = express();

// Apply middleware before routes
app.use(shouldSendSameSiteNone);

app.get('/', function (req, res) {
  // Set cookie with SameSite='None' as needed;
  res.cookie("foo", "bar", { sameSite: "none", secure: true });
  res.send('hello world');
});

app.listen(3000);


```

## Running tests

```
npm run test


 PASS  ./index.test.js

  ✓ Test Chrome 50 @ Win10 (true) (4ms)
  ✓ Test Chrome 67 @ Win10 (true) (1ms)
  ✓ Test Chrome 60 @ IOS (true)
  ✓ Test Chrome @ Mac (true)
  ✓ Test UC Browser 12.13.2 @ Andriod (true) (1ms)
  ✓ Test UC Browser 12.13.4 @ Andriod (true)
  ✓ Test Safari @ Mac 13 (true)
  ✓ Test Safari @ Mac 15.5 (true) (1ms)
  ✓ Test Safari @ ios 13 (true)
  ✓ Test Chrome 51 (false)
  ✓ Test Chrome 52 @ Win 10 (false)
  ✓ Test Chrome 53 @ Win 10 (false)
  ✓ Test Chrome 54 (false)
  ✓ Test Chrome 55 @ Mac (false)
  ✓ Test Chrome 56 @ Linux (false) (1ms)
  ✓ Test Chrome 57 @ Win 7 (false)
  ✓ Test Chrome 58 @ Android (false)
  ✓ Test Chrome 59 @ Win7 (false)
  ✓ Test Chrome 60 @ Win10 (false) (1ms)
  ✓ Test Chrome 61 @ Win10 (false)
  ✓ Test Chrome 62 @ Win10 (false)
  ✓ Test Chrome 63 @ Win7 (false)
  ✓ Test Chrome 64 @ Win7 (false) (1ms)
  ✓ Test Chrome 65 (false)
  ✓ Test Chrome 66 @ Win10 (false)
  ✓ Test Chrome 66 Webview (false)
  ✓ Test UC Browser @ 10.7 (false)
  ✓ Test UC Browser 12 @ Android (false) (1ms)
  ✓ Test UC Browser 11.5 @ iOS 11 (false) (1ms)
  ✓ Test Safari @ Mac 10.14 (false) (1ms)
  ✓ Test Embeded @ Mac 10.4 (false)
  ✓ Test Safari @ iOS 12 (false)
  ✓ Test Chrome @ iOS 12 (false)
  ✓ Test Firefox @ iOS 12 (false)
```

## Note

The approach for detecting incompatible clients are taken from this [update](https://www.chromium.org/updates/same-site/incompatible-clients).

The following incompatible clients were accounted for at the time of writing:

- Versions of Chrome from Chrome 51 to Chrome 66 (inclusive on both ends). These Chrome versions will reject a cookie with `SameSite=None`. This also affects older versions of Chromium-derived browsers, as well as Android WebView. This behavior was correct according to the version of the cookie specification at that time, but with the addition of the new "None" value to the specification, this behavior has been updated in Chrome 67 and newer. (Prior to Chrome 51, the SameSite attribute was ignored entirely and all cookies were treated as if they were `SameSite=None`.)
- Versions of UC Browser on Android prior to version 12.13.2. Older versions will reject a cookie with `SameSite=None`. This behavior was correct according to the version of the cookie specification at that time, but with the addition of the new "None" value to the specification, this behavior has been updated in newer versions of UC Browser.
- Versions of Safari and embedded browsers on MacOS 10.14 and all browsers on iOS 12. These versions will erroneously treat cookies marked with `SameSite=None` as if they were marked `SameSite=Strict`. This bug has been fixed on newer versions of iOS and MacOS.

Compatibilities of the following clients are unclear:

1. Versions of Chrome from Chrome 51 to Chrome 66 on **IOS device**; (Assumed compatible)
2. Versions of UC Browser on other non-Android platforms (e.g. IOS) prior to version 12.13.2. (Assumed Incompatible)

Please file an issue if additional incompatible clients are identified.
