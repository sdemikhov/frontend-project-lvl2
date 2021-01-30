install:
	npm install
lint:
	npx eslint .
publish:
	npm publish --dry-run
.PHONY: install lint publish