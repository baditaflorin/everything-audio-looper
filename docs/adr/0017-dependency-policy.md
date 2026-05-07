# 0017 - Dependency Policy

## Status

Accepted

## Context

The app needs browser audio, React UI, tests, and optional WASM. Dependencies should be production-ready and kept small.

## Decision

Use established libraries only:

- Vite, React, TypeScript, Tailwind CSS
- TanStack Query for async state
- zod for runtime metadata validation
- idb for IndexedDB
- Comlink for worker RPC
- Pyodide/librosa loaded lazily from their public distribution at runtime
- Vitest and Playwright for tests

Run `npm audit --audit-level=high` as part of security checks.

## Consequences

- Core first-load assets stay focused on the app.
- Optional WASM analysis does not block the default experience.
- New dependencies require a reason and should be recorded in a future ADR when significant.

## Alternatives Considered

- Custom state/data libraries. Rejected because battle-tested libraries are preferred.
