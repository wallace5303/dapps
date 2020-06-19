TESTS = $(shell find test -type f -name "*.js")
TESTTIMEOUT = 5000
REPORTER = tap 
JSCOVERAGE="./node_modules/visionmedia-jscoverage/jscoverage"

test: 
	@NODE_ENV=test ./node_modules/.bin/mocha --reporter $(REPORTER) --timeout $(TESTTIMEOUT) $(TESTS) 

test-cov: lib-cov
	@PRINTABLE_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@rm -rf lib-cov
	@${JSCOVERAGE} lib lib-cov

clean:
	@rm -rf lib-cov
	@rm -f coverage.html

.PHONY: test test-cov lib-cov clean
