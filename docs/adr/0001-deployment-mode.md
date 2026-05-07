# 0001 - Deployment Mode

## Status

Accepted

## Context

Everything Audio Looper records short environmental sounds, analyzes timing and transients, and turns the result into a playable local drum kit. The app does not need accounts, shared state, secrets, server-side mutation, or private API credentials in v1.

## Decision

Use Mode A: Pure GitHub Pages.

The app runs entirely in the browser using MediaDevices, Web Audio, IndexedDB, a service worker, and lazy-loaded WASM audio analysis. GitHub Pages serves the static files from the `main` branch `/docs` directory.

## Consequences

- Sections for a runtime backend, Docker runtime deployment, nginx, Prometheus, and server databases are intentionally absent.
- Audio processing must stay client-side and degrade gracefully when a browser cannot load optional WASM dependencies.
- Recordings never leave the user's device.
- GitHub Pages limitations apply: no custom response headers, no `_headers`, no `_redirects`, and service worker scope must match the repo base path.

## Alternatives Considered

- Mode B: GitHub Pages plus pre-built data. Rejected because v1 has no shared static dataset.
- Mode C: GitHub Pages plus Docker backend. Rejected because server audio processing would add privacy and operations cost without a v1 requirement.
