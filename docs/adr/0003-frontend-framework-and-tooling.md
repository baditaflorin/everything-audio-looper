# 0003 - Frontend Framework And Build Tooling

## Status

Accepted

## Context

The app is interaction-heavy: recording states, async analysis, keyboard pads, sequencer playback, persistence, and installable offline behavior.

## Decision

Use React, TypeScript strict mode, Vite, Tailwind CSS, TanStack Query, zod, idb, Comlink, Vitest, and Playwright.

## Consequences

- Vite gives fast local feedback and straightforward static output into `docs/`.
- React keeps transport, pad, and analysis states explicit.
- Tailwind produces a small CSS bundle while keeping UI styling colocated.
- TanStack Query handles async restore/cache flows even though most data is local.

## Alternatives Considered

- Vanilla TypeScript. Rejected because the UI state is non-trivial.
- Next.js or Remix. Rejected because v1 needs no server runtime.
