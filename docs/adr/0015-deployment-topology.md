# 0015 - Deployment Topology

## Status

Accepted

## Context

Mode A needs only GitHub Pages. The public app should be installable and usable offline after first load.

## Decision

Deploy only to GitHub Pages:

- Source repository: `https://github.com/baditaflorin/everything-audio-looper`
- Live app: `https://baditaflorin.github.io/everything-audio-looper/`
- Static assets: `main` branch `/docs`
- PWA: service worker generated at build time

## Consequences

- No `deploy/` directory is needed.
- No Docker, nginx, DNS, Prometheus, or server runbook is needed for v1.
- Rollback is a git revert of the publishing commit followed by push.

## Alternatives Considered

- Docker backend deployment. Rejected by ADR 0001.

