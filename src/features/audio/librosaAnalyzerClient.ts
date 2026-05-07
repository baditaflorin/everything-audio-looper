import * as Comlink from 'comlink';
import type { Onset } from './types';

export type LibrosaAnalysis = {
  bpm: number;
  onsets: Onset[];
};

type LibrosaWorkerApi = {
  analyze(samples: Float32Array, sampleRate: number): Promise<LibrosaAnalysis>;
};

export async function runLibrosaAnalysis(samples: Float32Array, sampleRate: number) {
  const worker = new Worker(new URL('../../workers/librosa.worker.ts', import.meta.url), {
    type: 'module',
    name: 'librosa-analyzer'
  });

  try {
    const api = Comlink.wrap<LibrosaWorkerApi>(worker);
    const copy = samples.slice();
    return await api.analyze(Comlink.transfer(copy, [copy.buffer]), sampleRate);
  } finally {
    worker.terminate();
  }
}
