import { describe, expect, it } from 'vitest';
import { createTechnoPattern, toggleStep } from './loopPattern';
import type { AudioSlice } from './types';

function slice(role: AudioSlice['role'], label: string): AudioSlice {
  return {
    id: label,
    label,
    role,
    color: '#64e0b8',
    startSample: 0,
    endSample: 100,
    peak: 1,
    samples: new Float32Array(100)
  };
}

describe('loop pattern', () => {
  it('creates a playable 16-step techno pattern', () => {
    const pattern = createTechnoPattern([
      slice('kick', 'Kick'),
      slice('snare', 'Snare'),
      slice('hat', 'Hat'),
      slice('perc', 'Perc')
    ]);

    expect(pattern).toHaveLength(4);
    expect(pattern[0][0]).toBe(true);
    expect(pattern[0][4]).toBe(true);
    expect(pattern[1][4]).toBe(true);
    expect(pattern[2][2]).toBe(true);
  });

  it('toggles a single step immutably', () => {
    const pattern = createTechnoPattern([slice('kick', 'Kick')]);
    const next = toggleStep(pattern, 0, 1);

    expect(next).not.toBe(pattern);
    expect(next[0][1]).toBe(true);
    expect(pattern[0][1]).toBe(false);
  });
});
