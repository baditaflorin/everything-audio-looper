# 0004 - Static Data Contract

## Status

Accepted

## Context

Mode A has no backend data pipeline. The frontend still needs build metadata so the public page can show version and commit.

## Decision

Generate `docs/version.json` during `make build`.

Schema version `1`:

```json
{
  "schemaVersion": 1,
  "version": "0.1.0",
  "commit": "short-git-sha",
  "builtAt": "ISO-8601 timestamp",
  "repositoryUrl": "https://github.com/baditaflorin/everything-audio-looper",
  "paypalUrl": "https://www.paypal.com/paypalme/florinbadita"
}
```

The app also receives the same values through Vite environment variables for first render.

## Consequences

- No runtime API is required.
- The visible commit is the source commit used when the static bundle was built.
- Breaking metadata changes require incrementing `schemaVersion`.

## Alternatives Considered

- Hardcode version text in React. Rejected because commit and build time should be generated.
- Fetch GitHub API at runtime. Rejected because it is unnecessary and less offline-friendly.

