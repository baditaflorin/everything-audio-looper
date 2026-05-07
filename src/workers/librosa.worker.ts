import * as Comlink from 'comlink';
import type { LibrosaAnalysis } from '../features/audio/librosaAnalyzerClient';

type PyodideRuntime = {
  loadPackage(packages: string | string[]): Promise<void>;
  pyimport(name: string): { install(packages: string | string[]): Promise<void> };
  globals: {
    set(name: string, value: unknown): void;
  };
  runPythonAsync<T = unknown>(code: string): Promise<T>;
};

let pyodidePromise: Promise<PyodideRuntime> | undefined;
let librosaReady = false;

async function ensurePyodide() {
  const pyodideUrl = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.mjs';
  pyodidePromise ??= import(/* @vite-ignore */ pyodideUrl).then(
    async (module: { loadPyodide: (options: { indexURL: string }) => Promise<PyodideRuntime> }) => {
      const runtime = await module.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
      });
      await runtime.loadPackage(['micropip', 'numpy', 'scipy']);
      return runtime;
    }
  );

  const pyodide = await pyodidePromise;
  if (!librosaReady) {
    const micropip = pyodide.pyimport('micropip');
    await micropip.install('librosa==0.10.2.post1');
    librosaReady = true;
  }

  return pyodide;
}

async function analyze(samples: Float32Array, sampleRate: number): Promise<LibrosaAnalysis> {
  const pyodide = await ensurePyodide();
  const sampleArray = Array.from(samples);
  pyodide.globals.set('samples_js', sampleArray);
  pyodide.globals.set('sample_rate_js', sampleRate);

  const result = await pyodide.runPythonAsync<string>(`
import json
import numpy as np
import librosa

y = np.asarray(samples_js, dtype=np.float32)
sr = int(sample_rate_js)

if y.size == 0:
    json.dumps({"bpm": 120, "onsets": []})
else:
    y = librosa.util.normalize(y)
    onset_samples = librosa.onset.onset_detect(
        y=y,
        sr=sr,
        units="samples",
        backtrack=True,
        pre_max=6,
        post_max=6,
        pre_avg=20,
        post_avg=20,
        delta=0.18,
        wait=2,
    )
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, _beats = librosa.beat.beat_track(y=y, sr=sr, onset_envelope=onset_env, units="time")
    if hasattr(tempo, "__len__"):
        tempo = float(np.asarray(tempo).reshape(-1)[0])
    else:
        tempo = float(tempo)

    onsets = []
    for sample in onset_samples[:24]:
        frame = int(librosa.samples_to_frames(int(sample)))
        strength = float(onset_env[min(frame, max(0, len(onset_env) - 1))]) if len(onset_env) else 0.0
        onsets.append({
            "sampleIndex": int(sample),
            "time": float(sample) / float(sr),
            "strength": strength,
        })

    json.dumps({"bpm": tempo, "onsets": onsets})
`);

  return JSON.parse(result) as LibrosaAnalysis;
}

Comlink.expose({ analyze });
