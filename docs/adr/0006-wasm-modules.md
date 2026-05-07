# 0006 - WASM Modules Used And Why

## Status

Accepted

## Context

The pitch calls for librosa-style onset and BPM detection. Browser-native JavaScript provides a fast fallback, but real librosa analysis requires Python packages in WASM.

## Decision

Lazy-load Pyodide in a web worker and install/use librosa for analysis when the user selects the Librosa WASM engine. Expose the worker through Comlink. Keep a TypeScript onset/BPM analyzer as the default fast path and fallback.

## Consequences

- Initial page load stays small because Pyodide/librosa are loaded only after user action.
- GitHub Pages cannot set COOP/COEP headers, so the worker uses single-threaded WASM-compatible behavior.
- If Pyodide or librosa fails to load, the app shows a clear notice and continues with local TypeScript DSP.

## Alternatives Considered

- Bundle Pyodide into the first-load app. Rejected because it would blow the asset budget.
- Use a server-side Python backend. Rejected by ADR 0001.
- Use only custom TypeScript DSP. Rejected because the pitch specifically values librosa/WASM.
