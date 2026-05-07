# 0002 - Architecture Overview And Module Boundaries

## Status

Accepted

## Context

The app needs real-time browser audio capture, offline-friendly playback, a responsive drum-pad UI, and analyzers that may run in a worker to avoid blocking the main thread.

## Decision

Use these module boundaries:

- `features/looper`: user workflow, transport controls, pads, sequencer, and composition state.
- `features/audio`: audio decoding, onset detection, BPM estimation, slicing, and Web Audio playback.
- `features/storage`: IndexedDB persistence for user kits and preferences.
- `workers`: optional Pyodide/librosa WASM analysis exposed through Comlink.
- `shared`: UI primitives, errors, version metadata, and utility helpers.

## Consequences

- Audio analysis and playback logic can be unit tested without React.
- WASM loading is isolated behind a provider interface and can fail over to TypeScript DSP.
- UI components stay small and domain-specific.

## Alternatives Considered

- Single-file prototype. Rejected because analysis, playback, and recording lifecycles would become tightly coupled.
- Runtime backend for analysis. Rejected by ADR 0001.

