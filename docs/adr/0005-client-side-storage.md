# 0005 - Client-Side Storage Strategy

## Status

Accepted

## Context

Users should be able to keep a generated kit locally without accounts or server sync.

## Decision

Use IndexedDB through `idb` for kit metadata, normalized sample PCM, BPM, and pad labels. Use `localStorage` only for small UI preferences such as analyzer mode and autoplay preference.

## Consequences

- Recordings remain local.
- Larger sample payloads avoid `localStorage` quota and serialization problems.
- Cross-device sync is out of scope for v1.

## Alternatives Considered

- OPFS. Good fit for larger audio projects, but IndexedDB is simpler for v1 kit objects.
- Server persistence. Rejected by ADR 0001.

