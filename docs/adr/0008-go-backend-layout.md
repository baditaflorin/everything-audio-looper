# 0008 - Go Backend Project Layout

## Status

Accepted

## Context

The bootstrap standard defines Go layout for Modes B and C. This project is Mode A.

## Decision

Do not include a Go backend, `cmd/`, `internal/`, `pkg/`, `api/`, or Docker runtime service in v1.

## Consequences

- Go lint/test hooks are skipped when no Go files exist.
- Runtime API, `/healthz`, `/readyz`, `/metrics`, and Docker image requirements do not apply.

## Alternatives Considered

- Add an empty Go skeleton. Rejected because unused scaffolding creates maintenance noise.
