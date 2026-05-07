# 0010 - GitHub Pages Publishing Strategy

## Status

Accepted

## Context

The live GitHub Pages URL is a first-class deliverable from the first commit. The repository also needs ADRs and documentation.

## Decision

Publish from the `main` branch `/docs` directory:

- Live URL: `https://baditaflorin.github.io/everything-audio-looper/`
- Vite `base`: `/everything-audio-looper/`
- Build output: `docs/`
- Documentation: `docs/adr/`, `docs/architecture.md`, `docs/deploy.md`, and related markdown files
- SPA fallback: copy `docs/index.html` to `docs/404.html`
- Cache busting: Vite hashed assets

Set `emptyOutDir: false` so Vite does not delete markdown documentation in `docs/`.

## Consequences

- The Pages publish directory is committed and explicitly not gitignored.
- Markdown docs are publicly reachable under the same Pages site.
- Build scripts must preserve docs while updating app assets.

## Alternatives Considered

- `gh-pages` branch. Rejected to keep all deliverables visible on `main`.
- Publishing from repository root. Rejected because root also contains source and tooling files.

