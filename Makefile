install:
	npm install

link:
	npm link

lint:
	npx eslint .

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8

publish:
	npm publish --dry-run

check: lint test publish

.PHONY: install link lint publish check test test-coverage
