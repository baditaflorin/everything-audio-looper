.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview screenshot hooks-pre-commit hooks-commit-msg hooks-pre-push hooks-post-merge hooks-post-checkout docker-build docker-push release compose-up compose-down clean

help:
	@printf "%s\n" \
		"make install-hooks     # wire .githooks" \
		"make dev               # run frontend dev server" \
		"make build             # build frontend into docs/ for GitHub Pages" \
		"make data              # Mode A no-op" \
		"make test              # unit tests" \
		"make test-integration  # no integration suite in Mode A v1" \
		"make smoke             # build, serve docs/, run Playwright" \
		"make lint              # eslint, prettier, TypeScript, npm audit" \
		"make fmt               # autoformat" \
		"make pages-preview     # serve docs/ locally like Pages" \
		"make screenshot        # capture docs/demo.png from the built app" \
		"make release           # tag v0.1.0 after checks" \
		"make clean             # remove local generated outputs"

install-hooks:
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev:
	npm run dev

build:
	npm run build

data:
	@echo "Mode A: no static data pipeline is needed."

test:
	npm run test

test-integration:
	@echo "Mode A v1 has no separate integration suite."

smoke:
	npm run smoke

lint:
	npm run lint
	npm run typecheck
	npm run audit

fmt:
	npm run fmt

pages-preview:
	npm run pages-preview

screenshot:
	@PORT="$${PLAYWRIGHT_PORT:-$$((4500 + RANDOM % 1000))}"; \
	node scripts/serve-static.mjs docs "$$PORT" /everything-audio-looper/ >/tmp/everything-audio-looper-screenshot.log 2>&1 & \
	server_pid="$$!"; \
	trap 'kill "$$server_pid" >/dev/null 2>&1 || true' EXIT; \
	sleep 1; \
	node scripts/capture-demo.mjs "http://127.0.0.1:$$PORT/everything-audio-looper/" docs/demo.png

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	@echo "Usage: .githooks/commit-msg <commit-msg-file>"

hooks-pre-push:
	.githooks/pre-push

hooks-post-merge:
	.githooks/post-merge

hooks-post-checkout:
	.githooks/post-checkout

docker-build:
	@echo "Mode A: Docker backend is intentionally absent."

docker-push:
	@echo "Mode A: Docker backend is intentionally absent."

release: lint test build smoke
	@if git rev-parse v0.1.0 >/dev/null 2>&1; then \
		echo "Tag v0.1.0 already exists."; \
	else \
		git tag -a v0.1.0 -m "v0.1.0"; \
	fi

compose-up:
	@echo "Mode A: no Docker Compose stack exists."

compose-down:
	@echo "Mode A: no Docker Compose stack exists."

clean:
	rm -rf coverage playwright-report test-results .vite node_modules/.tmp
