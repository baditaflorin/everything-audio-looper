import type { AudioSlice, Pattern } from './types';

export const STEPS = 16;
export const MAX_PATTERN_PADS = 8;

export function createEmptyPattern(padCount: number): Pattern {
  return Array.from({ length: padCount }, () => Array.from({ length: STEPS }, () => false));
}

export function createTechnoPattern(slices: AudioSlice[]): Pattern {
  const padCount = Math.min(MAX_PATTERN_PADS, Math.max(1, slices.length));
  const pattern = createEmptyPattern(padCount);
  const roleIndex = (role: AudioSlice['role'], fallback: number) => {
    const found = slices.findIndex((slice) => slice.role === role);
    return found >= 0 && found < padCount ? found : Math.min(fallback, padCount - 1);
  };

  const kick = roleIndex('kick', 0);
  const snare = roleIndex('snare', 1);
  const hat = roleIndex('hat', 2);
  const clap = roleIndex('clap', 3);
  const perc = roleIndex('perc', 4);

  for (const step of [0, 4, 8, 12]) pattern[kick][step] = true;
  for (const step of [4, 12]) pattern[snare][step] = true;
  for (const step of [2, 6, 10, 14]) pattern[hat][step] = true;
  for (const step of [4, 12]) pattern[clap][step] = true;
  for (const step of [3, 7, 11, 15]) pattern[perc][step] = true;

  if (padCount > 5) {
    pattern[5][5] = true;
    pattern[5][13] = true;
  }

  if (padCount > 6) {
    pattern[6][1] = true;
    pattern[6][9] = true;
  }

  if (padCount > 7) {
    pattern[7][14] = true;
  }

  return pattern;
}

export function toggleStep(pattern: Pattern, padIndex: number, stepIndex: number): Pattern {
  return pattern.map((row, rowIndex) =>
    row.map((active, columnIndex) =>
      rowIndex === padIndex && columnIndex === stepIndex ? !active : active
    )
  );
}
