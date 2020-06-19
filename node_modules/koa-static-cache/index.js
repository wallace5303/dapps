var crypto = require('crypto')
var fs = require('mz/fs')
var zlib = require('mz/zlib')
var path = require('path')
var mime = require('mime-types')
var compressible = require('compressible')
var readDir = require('fs-readdir-recursive')
var debug = require('debug')('koa-static-cache')

module.exports = function staticCache(dir, options, files) {
  if (typeof dir === 'object') {
    files = options
    options = dir
    dir = null
  }

  options = options || {}
  // prefix must be ASCII code
  options.prefix = (options.prefix || '').replace(/\/*$/, '/')
  files = new FileManager(files || options.files)
  dir = dir || options.dir || process.cwd()
  dir = path.normalize(dir)
  var enableGzip = !!options.gzip
  var filePrefix = path.normalize(options.prefix.replace(/^\//, ''))

  // option.filter
  var fileFilter = function () { return true }
  if (Array.isArray(options.filter)) fileFilter = function (file) { return ~options.filter.indexOf(file) }
  if (typeof options.filter === 'function') fileFilter = options.filter

  if (options.preload !== false) {
    readDir(dir).filter(fileFilter).forEach(function (name) {
      loadFile(name, dir, options, files)
    })
  }

  return async (ctx, next) => {
    // only accept HEAD and GET
    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') return await next()
    // check prefix first to avoid calculate
    if (ctx.path.indexOf(options.prefix) !== 0) return await next()

    // decode for `/%E4%B8%AD%E6%96%87`
    // normalize for `//index`
    var filename = path.normalize(safeDecodeURIComponent(ctx.path))

    // check alias
    if (options.alias && options.alias[filename]) filename = options.alias[filename];

    var file = files.get(filename)
    // try to load file
    if (!file) {
      if (!options.dynamic) return await next()
      if (path.basename(filename)[0] === '.') return await next()
      if (filename.charAt(0) === path.sep) filename = filename.slice(1)

      // trim prefix
      if (options.prefix !== '/') {
        if (filename.indexOf(filePrefix) !== 0) return await next()
        filename = filename.slice(filePrefix.length)
      }

      var fullpath = path.join(dir, filename)
      // files that can be accessd should be under options.dir
      if (fullpath.indexOf(dir) !== 0) {
        return await next()
      }

      var s
      try {
        s = await fs.stat(fullpath)
      } catch (err) {
        return await next()
      }
      if (!s.isFile()) return await next()

      file = loadFile(filename, dir, options, files)
    }

    ctx.status = 200

    if (enableGzip) ctx.vary('Accept-Encoding')

    if (!file.buffer) {
      var stats = await fs.stat(file.path)
      if (stats.mtime > file.mtime) {
        file.mtime = stats.mtime
        file.md5 = null
        file.length = stats.size
      }
    }

    ctx.response.lastModified = file.mtime
    if (file.md5) ctx.response.etag = file.md5

    if (ctx.fresh)
      return ctx.status = 304

    ctx.type = file.type
    ctx.length = file.zipBuffer ? file.zipBuffer.length : file.length
    ctx.set('cache-control', file.cacheControl || 'public, max-age=' + file.maxAge)
    if (file.md5) ctx.set('content-md5', file.md5)

    if (ctx.method === 'HEAD')
      return

    var acceptGzip = ctx.acceptsEncodings('gzip') === 'gzip'

    if (file.zipBuffer) {
      if (acceptGzip) {
        ctx.set('content-encoding', 'gzip')
        ctx.body = file.zipBuffer
      } else {
        ctx.body = file.buffer
      }
      return
    }

    var shouldGzip = enableGzip
      && file.length > 1024
      && acceptGzip
      && compressible(file.type)

    if (file.buffer) {
      if (shouldGzip) {

        var gzFile = files.get(filename + '.gz')
        if (options.usePrecompiledGzip && gzFile && gzFile.buffer) { // if .gz file already read from disk
          file.zipBuffer = gzFile.buffer
        } else {
          file.zipBuffer = await zlib.gzip(file.buffer)
        }
        ctx.set('content-encoding', 'gzip')
        ctx.body = file.zipBuffer
      } else {
        ctx.body = file.buffer
      }
      return
    }

    var stream = fs.createReadStream(file.path)

    // update file hash
    if (!file.md5) {
      var hash = crypto.createHash('md5')
      stream.on('data', hash.update.bind(hash))
      stream.on('end', function () {
        file.md5 = hash.digest('base64')
      })
    }

    ctx.body = stream
    // enable gzip will remove content length
    if (shouldGzip) {
      ctx.remove('content-length')
      ctx.set('content-encoding', 'gzip')
      ctx.body = stream.pipe(zlib.createGzip())
    }
  }
}

function safeDecodeURIComponent(text) {
  try {
    return decodeURIComponent(text)
  } catch (e) {
    return text
  }
}

/**
 * load file and add file content to cache
 *
 * @param {String} name
 * @param {String} dir
 * @param {Object} options
 * @param {Object} files
 * @return {Object}
 * @api private
 */

function loadFile(name, dir, options, files) {
  var pathname = path.normalize(path.join(options.prefix, name))
  if (!files.get(pathname)) files.set(pathname, {})
  var obj = files.get(pathname)
  var filename = obj.path = path.join(dir, name)
  var stats = fs.statSync(filename)
  var buffer = fs.readFileSync(filename)

  obj.cacheControl = options.cacheControl
  obj.maxAge = obj.maxAge ? obj.maxAge : options.maxAge || 0
  obj.type = obj.mime = mime.lookup(pathname) || 'application/octet-stream'
  obj.mtime = stats.mtime
  obj.length = stats.size
  obj.md5 = crypto.createHash('md5').update(buffer).digest('base64')

  debug('file: ' + JSON.stringify(obj, null, 2))
  if (options.buffer)
    obj.buffer = buffer

  buffer = null
  return obj
}

function FileManager(store) {
  if (store && typeof store.set === 'function' && typeof store.get === 'function') {
    this.store = store
  } else {
    this.map = store || Object.create(null)
  }
}

FileManager.prototype.get = function (key) {
  return this.store ? this.store.get(key) : this.map[key]
}

FileManager.prototype.set = function (key, value) {
  if (this.store) return this.store.set(key, value)
  this.map[key] = value
}
