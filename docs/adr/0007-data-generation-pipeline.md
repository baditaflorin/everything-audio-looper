# 0007 - Data Generation Pipeline

## Status

Accepted

## Context

Mode B projects use offline generators to create static artifacts. Everything Audio Looper has no shared static data in v1.

## Decision

No data-generation pipeline is included in v1. `make data` is intentionally a no-op that explains Mode A has no generated dataset.

## Consequences

- There are no committed Parquet, SQLite, or JSON domain datasets.
- Future shared sample packs or presets can introduce a Mode B artifact contract through a new ADR.

## Alternatives Considered

- Generate demo samples at build time. Rejected because demo sounds can be synthesized directly in the browser.

