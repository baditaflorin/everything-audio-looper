import { describe, expect, it } from 'vitest';
import { applyTinyFade, normalizeSamples } from './audioBufferUtils';

describe('audio buffer utilities', () => {
  it('normalizes samples without clipping above unity', () => {
    const normalized = normalizeSamples(new Float32Array([0, 0.25, -0.5]));

    expect(Array.from(normalized)).toEqual([0, 0.5, -1]);
  });

  it('keeps silent samples silent', () => {
    const normalized = normalizeSamples(new Float32Array([0, 0, 0]));

    expect(Array.from(normalized)).toEqual([0, 0, 0]);
  });

  it('applies a short fade to slice edges', () => {
    const samples = new Float32Array(1_000).fill(1);
    const faded = applyTinyFade(samples, 44_100);

    expect(faded[0]).toBe(0);
    expect(faded[500]).toBe(1);
    expect(faded[faded.length - 1]).toBeLessThan(0.01);
  });
});
