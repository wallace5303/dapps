
include node_modules/make-lint/index.mk

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--harmony \
		--harmony-async-await \
		test/*.js \
		--bail

test-cov:
	@NODE_ENV=test node --harmony \
		--harmony-async-await \
		./node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		-- -u exports \
		--require should \
		test/*.js \
		--bail

test-travis:
	node --harmony \
		--harmony-async-await \
		./node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha --report lcovonly \
		-- -R dot test/*.js

.PHONY: test test-cov test-travis
