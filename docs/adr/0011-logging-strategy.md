# 0011 - Logging Strategy

## Status

Accepted

## Context

Mode A has no server logs. Browser console output should not be noisy in production.

## Decision

Use a tiny browser logger that emits debug logs only in development. Production logs are limited to actionable warnings and errors around microphone permission, analysis fallback, and storage failures.

## Consequences

- No server-side log collection is required.
- Production builds should not emit routine console logs.

## Alternatives Considered

- Client log ingestion endpoint. Rejected because it would introduce a backend and privacy concerns.
