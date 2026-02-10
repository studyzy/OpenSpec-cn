# Makefile for OpenSpec-cn

# You can override these via environment if needed
PNPM ?= pnpm
NODE ?= node

.PHONY: all install deps build link unlink clean release test

# Default: install deps, build, and link as global "openspec-cn"
all: install

# Install dependencies, build, and link
install: deps build link

# Install JS dependencies using pnpm
deps:
	$(PNPM) install

# Build the project (calls the build script)
build:
	$(PNPM) run build

# Link this package globally so that the "openspec-cn" command is available
link:
	npm link

# Remove the global link for this package
unlink:
	npm unlink --global @studyzy/openspec-cn || true

# Simple clean placeholder (extend as needed)
clean:
	rm -rf node_modules dist

# Release a new version to npm (publishes @studyzy/openspec-cn)
release:
	$(PNPM) run release:local

test: build
	$(PNPM) test

lint:
	$(PNPM) lint