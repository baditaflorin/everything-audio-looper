# 0014 - Error Handling Conventions

## Status

Accepted

## Context

Browser audio can fail for permission, unsupported APIs, malformed decoded audio, unavailable WASM packages, or storage quota issues.

## Decision

Use typed `AppError` objects for expected failures and a global error toast for user-visible recovery. Analyzer failures must include a fallback path when possible. Promise rejections in UI flows are caught at the boundary that can show the best recovery action.

## Consequences

- Users see actionable errors instead of silent failures.
- WASM problems do not block the core tool.
- Unexpected React render errors are caught by an error boundary.

## Alternatives Considered

- Throw raw `Error` values everywhere. Rejected because recovery messaging becomes inconsistent.

