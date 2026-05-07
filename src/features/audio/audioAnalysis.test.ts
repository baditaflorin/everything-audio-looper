import { describe, expect, it } from 'vitest';
import { analyzeWithTypeScript, estimateBpm } from './audioAnalysis';
import { createDemoRecording } from './demoKit';
import type { Onset } from './types';

describe('audio analysis', () => {
  it('detects BPM and enough slices from the synthetic demo recording', () => {
    const sampleRate = 44_100;
    const samples = createDemoRecording(sampleRate);
    const result = analyzeWithTypeScript(samples, sampleRate);

    expect(result.bpm).toBeGreaterThanOrEqual(119);
    expect(result.bpm).toBeLessThanOrEqual(129);
    expect(result.onsets.length).toBeGreaterThanOrEqual(8);
    expect(result.slices.length).toBeGreaterThanOrEqual(8);
  });

  it('normalizes interval-derived BPM into a dance range', () => {
    const onsets: Onset[] = [0, 0.5, 1, 1.5, 2].map((time) => ({
      sampleIndex: Math.round(time * 48_000),
      time,
      strength: 1
    }));

    expect(estimateBpm(onsets)).toBe(120);
  });
});
