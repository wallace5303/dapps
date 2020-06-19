# Change Log

All notable changes to this project will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org/).

## [1.2.1](https://github.com/blakeembrey/co-mocha/compare/v1.2.0...v1.2.1) - 2017-10-11

### Changed

- Add mocha v4 to version range

## [1.2.0](https://github.com/blakeembrey/co-mocha/compare/v1.1.3...v1.2.0) - 2017-01-24

### Changed

- Check `exports.name` when auto-hooking Mocha instead of matching path name (for alternative NPM clients that link)

## [1.1.3](https://github.com/blakeembrey/co-mocha/compare/v1.1.2...v1.1.3) - 2016-08-01

### Changed

- Update Mocha `peerDependency` version range

## [1.1.2](https://github.com/blakeembrey/co-mocha/compare/v1.1.1...v1.1.2) - 2015-06-17

### Changed

- Wrap `this.fn.toString` in a custom function to support the HTML reporter with function bodies.

### Added

- Created a project CHANGELOG.

## [1.1.1](https://github.com/blakeembrey/co-mocha/compare/v1.1.0...v1.1.1) - 2015-06-16

### Changed

- Update to latest dev dependencies.
- Use `--harmony` flag for `iojs` support in CI.
- Update to `standard` module format and syntax.

### Added

- Use `pre-commit` for testing.
- Add node `0.12` and `iojs` to Travis CI.
- Support for browsers.
- Add instructions for monkey patching Mocha manually to README.
- Add tests for browsers on Travis CI.

### Removed

- Remove `bluebird` dependency and use native promises.

## [1.1.0](https://github.com/blakeembrey/co-mocha/compare/v1.0.3...v1.1.0) - 2014-11-18

### Changed

- Update to `co@4.x`.

## [1.0.3](https://github.com/blakeembrey/co-mocha/compare/v1.0.2...v1.0.3) - 2014-10-29

### Changed

- Use `require.cache` instance of main script children.

## [1.0.2](https://github.com/blakeembrey/co-mocha/compare/v1.0.1...v1.0.2) - 2014-10-22

### Changed

- Update Mocha peer dependency to support Mocha 2.x.

## [1.0.1](https://github.com/blakeembrey/co-mocha/compare/v1.0.0...v1.0.1) - 2014-09-02

### Changed

- Simplified code back to the original release snippet.

## [1.0.0](https://github.com/blakeembrey/co-mocha/compare/v0.0.4...v1.0.0) - 2014-08-18

### Changed

- Switch to using promises internally.
- Refactor generator tests to work as expected.
- Update dependencies.
- Update author information.

### Added

- Add Travis CI.
- Add badges to README.
- Add code coverage information.

## [0.0.4](https://github.com/blakeembrey/co-mocha/compare/v0.0.3...v0.0.4) - 2014-05-06

### Fixed

- Correctly pass context for test functions.

## [0.0.3](https://github.com/blakeembrey/co-mocha/compare/v0.0.2...v0.0.3) - 2014-05-05

### Added

- Add support for ES6 transpilers.
- Find and monkey patch any available Mocha module loaded under node main.

## [0.0.2](https://github.com/blakeembrey/co-mocha/compare/v0.0.1...v0.0.2) - 2014-03-04

### Added

- Released on NPM under `co-mocha`.
- Simple example in README.

## 0.0.1 - 2014-02-04

### Added

- Initial release based on blog post for testing using generator functions.
