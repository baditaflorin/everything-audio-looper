# 0013 - Testing Strategy

## Status

Accepted

## Context

The highest-risk logic is audio analysis, slicing, sequencer timing, build output, and browser compatibility.

## Decision

Use:

- Vitest unit tests for frontend logic modules.
- Playwright smoke/e2e test for the demo-kit happy path.
- `scripts/smoke.sh` to build, serve `docs/`, and run Playwright.
- `make test`, `make build`, `make smoke`, and hook targets as the local quality gates.

## Consequences

- Tests run locally without GitHub Actions.
- Microphone flows are tested manually; automated smoke uses synthesized demo audio to avoid browser permission flakiness.

## Alternatives Considered

- Full microphone automation. Rejected because it is brittle and unnecessary for fast pre-push checks.
