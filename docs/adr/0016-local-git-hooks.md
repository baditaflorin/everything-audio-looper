# 0016 - Local Git Hooks

## Status

Accepted

## Context

The project explicitly avoids GitHub Actions. Local hooks must catch formatting, tests, builds, smoke checks, secret scans, and commit message format.

## Decision

Use plain `.githooks/` wired by `make install-hooks`.

Hooks:

- `pre-commit`: format check, lint, TypeScript check, and gitleaks when installed.
- `commit-msg`: Conventional Commits validation.
- `pre-push`: `make test`, `make build`, and `make smoke`.
- `post-merge` and `post-checkout`: run dependency/install hints and no-op generated-code refresh.

## Consequences

- Contributors can inspect and run hook scripts directly.
- Missing optional tools such as gitleaks produce clear warnings unless installed.
- No CI minutes or GitHub Actions configuration is needed.

## Alternatives Considered

- Lefthook. Rejected to keep the hook system transparent and dependency-light.
