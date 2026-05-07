# 0012 - Metrics And Observability

## Status

Accepted

## Context

The default for Mode A/B is no analytics unless there is a clear need.

## Decision

Do not include analytics in v1. Observability is local: error toasts, visible analyzer status, and manual smoke tests.

## Consequences

- No PII, usage events, IP addresses, or recordings are collected.
- Product learning comes from user feedback, issues, and stars on GitHub.

## Alternatives Considered

- Plausible analytics. Rejected for v1 because usage insight is not required to validate the core local audio workflow.

