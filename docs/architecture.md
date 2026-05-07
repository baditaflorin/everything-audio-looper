# Architecture

Everything Audio Looper is a Mode A static GitHub Pages application.

```mermaid
C4Context
  title Everything Audio Looper Context
  Person(creator, "Creator", "Records claps, taps, clicks, and short environmental sounds")
  System_Boundary(pages, "GitHub Pages: https://baditaflorin.github.io/everything-audio-looper/") {
    System(app, "Everything Audio Looper", "Static browser app")
  }
  System_Ext(pyodide, "Pyodide/librosa CDN", "Optional lazy WASM analyzer")
  System_Ext(github, "GitHub Repository", "https://github.com/baditaflorin/everything-audio-looper")
  Rel(creator, app, "records, analyzes, plays")
  Rel(app, pyodide, "loads only when Librosa WASM is selected")
  Rel(creator, github, "stars or forks")
```

```mermaid
flowchart LR
  subgraph Browser["Browser"]
    UI["React UI"]
    Recorder["MediaDevices Recorder"]
    Audio["Web Audio Engine"]
    Analyzer["TypeScript Analyzer"]
    Worker["Librosa WASM Worker"]
    DB["IndexedDB"]
    SW["Service Worker"]
  end

  UI --> Recorder
  Recorder --> Analyzer
  Analyzer --> Audio
  UI --> Audio
  UI --> DB
  UI --> Worker
  Worker --> Analyzer
  SW --> UI
```

## Boundaries

- UI state lives in `src/features/looper`.
- DSP, slicing, BPM estimation, and playback live in `src/features/audio`.
- Persistence lives in `src/features/storage`.
- Optional WASM analysis lives in `src/workers`.

No backend, server database, auth service, or runtime secret store exists in v1.

