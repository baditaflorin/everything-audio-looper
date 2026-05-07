# 0009 - Configuration And Secrets Management

## Status

Accepted

## Context

The app is static and should never require secrets in the browser.

## Decision

Use Vite build variables for public values only:

- `VITE_APP_BASE`
- `VITE_APP_VERSION`
- `VITE_GIT_COMMIT`
- `VITE_BUILT_AT`

Commit `.env.example` with placeholders. Block real `.env*`, private keys, and certificate material through `.gitignore` and gitleaks hooks.

## Consequences

- Frontend contains no secrets.
- GitHub Pages deploys are reproducible from public repository state.
- Any future secret-bearing flow requires a new ADR and cannot be implemented purely in Mode A.

## Alternatives Considered

- Runtime config API. Rejected because there is no backend.

