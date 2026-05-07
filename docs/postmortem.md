# Postmortem

## What Was Built

Everything Audio Looper v0.1.0 is a static GitHub Pages app that records short environmental audio, analyzes transients and BPM locally, slices the recording into drum pads, generates a 16-step pattern, and plays the result through Web Audio.

Live app:

https://baditaflorin.github.io/everything-audio-looper/

Repository:

https://github.com/baditaflorin/everything-audio-looper

## Was Mode A Correct?

Yes. Mode A was the right choice in hindsight.

The v1 needs microphone access, local DSP, playback, local storage, and optional WASM. None of those require a runtime server, secrets, accounts, shared writes, or a database. GitHub Pages plus browser APIs kept the privacy promise intact and avoided backend operational work.

## What Worked

- Vite output to `docs/` works cleanly with GitHub Pages once markdown docs are preserved.
- The fast TypeScript analyzer is good enough for immediate feedback and testable with synthetic recordings.
- Playwright smoke tests can exercise the happy path without microphone permission flakiness by using the demo kit.
- Local hooks with gitleaks, lint, typecheck, tests, build, and smoke are viable without GitHub Actions.

## What Did Not Work Smoothly

- Build metadata was initially tied to wall-clock time and publish commits, which made repeated builds dirty.
- Workbox service-worker source maps included random temporary paths, so they had to be disabled for deterministic output.
- Browser service workers can make local smoke tests see stale apps on reused localhost origins, so Playwright blocks service workers in tests.

## What Surprised Us

- The optional Librosa/Pyodide path is feasible as a lazy worker, but it is too heavy and package-sensitive to make the default v1 analyzer.
- The simpler onset detector produced a usable 15-pad demo kit quickly, which is enough to validate the creative loop.

## Accepted Tech Debt

- Librosa WASM is implemented as an optional best-effort worker with fallback rather than a guaranteed default engine.
- Recorded kits store normalized mono PCM in IndexedDB; larger future projects may want OPFS.
- The sequencer pattern generator is intentionally simple and rule-based.
- Microphone capture is manually verified; automated tests use synthesized audio.

## Next Three Improvements

1. Add an export path for WAV loops and one-shot sample packs.
2. Add per-pad trim, gain, choke, and role controls.
3. Add a smaller dedicated WASM onset/BPM engine if Pyodide/librosa remains too heavy for casual users.

## Time Spent Vs Estimate

Estimated v1 scaffold and implementation: 4-6 hours.

Actual focused build time in this session: about 2 hours.

The time savings came from staying Mode A and using a synthetic demo path for reliable testing. The extra time went into making Pages builds deterministic and hook-friendly.
