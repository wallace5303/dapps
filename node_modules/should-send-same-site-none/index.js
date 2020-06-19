function intToString(intValue) {
  return String(intValue);
}

function stringToInt(strValue) {
  return parseInt(strValue, 10) || 0;
}

// Don’t send `SameSite=None` to known incompatible clients.
function isSameSiteNoneCompatible(useragent) {
  return !isSameSiteNoneIncompatible(String(useragent));
}

// Classes of browsers known to be incompatible.
function isSameSiteNoneIncompatible(useragent) {
  return (
    hasWebKitSameSiteBug(useragent) ||
    dropsUnrecognizedSameSiteCookies(useragent)
  );
}

function hasWebKitSameSiteBug(useragent) {
  return (
    isIosVersion(12, useragent) ||
    (isMacosxVersion(10, 14, useragent) &&
      (isSafari(useragent) || isMacEmbeddedBrowser(useragent)))
  );
}

function dropsUnrecognizedSameSiteCookies(useragent) {
  return (
    (isChromiumBased(useragent) &&
      isChromiumVersionAtLeast(51, useragent) &&
      !isChromiumVersionAtLeast(67, useragent)) ||
    (isUcBrowser(useragent) && !isUcBrowserVersionAtLeast(12, 13, 2, useragent))
  );
}

// Regex parsing of User-Agent string.
function regexContains(stringValue, regex) {
  var matches = stringValue.match(regex);
  return matches !== null;
}

function extractRegexMatch(stringValue, regex, offsetIndex) {
  var matches = stringValue.match(regex);

  if (matches !== null && matches[offsetIndex] !== undefined) {
    return matches[offsetIndex];
  }

  return null;
}

function isIosVersion(major, useragent) {
  var regex = /\(iP.+; CPU .*OS (\d+)[_\d]*.*\) AppleWebKit\//;
  // Extract digits from first capturing group.
  return extractRegexMatch(useragent, regex, 1) === intToString(major);
}

function isMacosxVersion(major, minor, useragent) {
  var regex = /\(Macintosh;.*Mac OS X (\d+)_(\d+)[_\d]*.*\) AppleWebKit\//;
  // Extract digits from first and second capturing groups.
  return (
    extractRegexMatch(useragent, regex, 1) === intToString(major) &&
    extractRegexMatch(useragent, regex, 2) === intToString(minor)
  );
}

function isSafari(useragent) {
  var safari_regex = /Version\/.* Safari\//;
  return useragent.match(safari_regex) !== null && !isChromiumBased(useragent);
}

function isMacEmbeddedBrowser(useragent) {
  var regex = /^Mozilla\/[\.\d]+ \(Macintosh;.*Mac OS X [_\d]+\) AppleWebKit\/[\.\d]+ \(KHTML, like Gecko\)$/;

  return regexContains(useragent, regex);
}

function isChromiumBased(useragent) {
  const regex = /Chrom(e|ium)/;
  return regexContains(useragent, regex);
}

function isChromiumVersionAtLeast(major, useragent) {
  var regex = /Chrom[^ \/]+\/(\d+)[\.\d]* /;
  // Extract digits from first capturing group.
  var version = stringToInt(extractRegexMatch(useragent, regex, 1));
  return version >= major;
}

function isUcBrowser(useragent) {
  var regex = /UCBrowser\//;
  return regexContains(useragent, regex);
}

function isUcBrowserVersionAtLeast(major, minor, build, useragent) {
  var regex = /UCBrowser\/(\d+)\.(\d+)\.(\d+)[\.\d]* /;
  // Extract digits from three capturing groups.
  var major_version = stringToInt(extractRegexMatch(useragent, regex, 1));
  var minor_version = stringToInt(extractRegexMatch(useragent, regex, 2));
  var build_version = stringToInt(extractRegexMatch(useragent, regex, 3));
  if (major_version !== major) {
    return major_version > major;
  }
  if (minor_version != minor) {
    return minor_version > minor;
  }

  return build_version >= build;
}

var shouldSendSameSiteNone = function(req, res, next) {
  var writeHead = res.writeHead;
  res.writeHead = function() {
    var ua = req.get("user-agent");
    var isCompatible = isSameSiteNoneCompatible(ua);
    var cookies = res.get("Set-Cookie");
    var removeSameSiteNone = function(str) {
      return str.replace(/;\s*SameSite\s*=\s*None\s*(?=;|$)/ig, "");
    };
    if (!isCompatible && cookies) {
      if (Array.isArray(cookies)) {
        cookies = cookies.map(removeSameSiteNone);
      } else {
        cookies = removeSameSiteNone(cookies);
      }
      res.set("Set-Cookie", cookies);
    }

    writeHead.apply(this, arguments);
  };
  next();
};

module.exports = {
  shouldSendSameSiteNone: shouldSendSameSiteNone,
  isSameSiteNoneCompatible: isSameSiteNoneCompatible
};
