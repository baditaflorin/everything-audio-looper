import { analyzeWithTypeScript } from './audioAnalysis';
import type { DrumKit } from './types';

export function createDemoRecording(sampleRate = 44_100) {
  const bpm = 124;
  const beats = 8;
  const duration = (60 / bpm) * beats;
  const samples = new Float32Array(Math.ceil(duration * sampleRate));
  const step = Math.floor((60 / bpm / 2) * sampleRate);

  const events = [
    { at: 0, frequency: 86, decay: 0.12, noise: 0.08 },
    { at: step, frequency: 340, decay: 0.045, noise: 0.5 },
    { at: step * 2, frequency: 170, decay: 0.08, noise: 0.28 },
    { at: step * 3, frequency: 900, decay: 0.025, noise: 0.55 },
    { at: step * 4, frequency: 92, decay: 0.13, noise: 0.08 },
    { at: step * 5, frequency: 420, decay: 0.045, noise: 0.46 },
    { at: step * 6, frequency: 180, decay: 0.07, noise: 0.32 },
    { at: step * 7, frequency: 1200, decay: 0.022, noise: 0.5 },
    { at: step * 8, frequency: 88, decay: 0.12, noise: 0.08 },
    { at: step * 9, frequency: 600, decay: 0.035, noise: 0.38 },
    { at: step * 10, frequency: 150, decay: 0.07, noise: 0.3 },
    { at: step * 11, frequency: 1000, decay: 0.025, noise: 0.48 },
    { at: step * 12, frequency: 90, decay: 0.12, noise: 0.08 },
    { at: step * 13, frequency: 390, decay: 0.05, noise: 0.46 },
    { at: step * 14, frequency: 200, decay: 0.08, noise: 0.3 },
    { at: step * 15, frequency: 1400, decay: 0.02, noise: 0.52 }
  ];

  for (const event of events) {
    addPercussion(samples, sampleRate, event.at, event.frequency, event.decay, event.noise);
  }

  return samples;
}

export function createDemoKit(): DrumKit {
  const sampleRate = 44_100;
  const sourceSamples = createDemoRecording(sampleRate);
  const analysis = analyzeWithTypeScript(sourceSamples, sampleRate);

  return {
    id: 'demo-kit',
    name: 'Demo kitchen-table kit',
    source: 'demo',
    analyzer: 'fast-js',
    createdAt: new Date().toISOString(),
    sampleRate,
    duration: sourceSamples.length / sampleRate,
    bpm: analysis.bpm,
    onsets: analysis.onsets,
    slices: analysis.slices,
    sourceSamples
  };
}

function addPercussion(
  target: Float32Array,
  sampleRate: number,
  start: number,
  frequency: number,
  decaySeconds: number,
  noiseAmount: number
) {
  const length = Math.floor(sampleRate * decaySeconds);

  for (let index = 0; index < length && start + index < target.length; index += 1) {
    const time = index / sampleRate;
    const envelope = Math.exp(-time / decaySeconds) * (1 - index / length);
    const tone = Math.sin(2 * Math.PI * frequency * time);
    const noise = seededNoise(start + index) * noiseAmount;
    target[start + index] += (tone * (1 - noiseAmount) + noise) * envelope * 0.9;
  }
}

function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}
