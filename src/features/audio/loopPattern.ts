import type { AudioSlice, Pattern } from './types';

export const STEPS = 16;
export const MAX_PATTERN_PADS = 8;

export function createEmptyPattern(padCount: number): Pattern {
  return Array.from({ length: padCount }, () => Array.from({ length: STEPS }, () => false));
}

// Genre patterns are 16-step grids per role. Steps are numbered 0..15, where
// 0,4,8,12 are the beats and the rest are subdivisions. References are common
// drum-machine vocabulary (Roland 808/909 manuals, "How to Make Beats" etc.).
type GenreRecipe = {
  kick: number[];
  snare: number[];
  hat: number[];
  clap: number[];
  perc: number[];
  extras?: Array<{ pad: number; steps: number[] }>;
};

const GENRE_RECIPES: Record<GenrePatternId, GenreRecipe> = {
  techno: {
    kick: [0, 4, 8, 12],
    snare: [4, 12],
    hat: [2, 6, 10, 14],
    clap: [4, 12],
    perc: [3, 7, 11, 15],
    extras: [
      { pad: 5, steps: [5, 13] },
      { pad: 6, steps: [1, 9] },
      { pad: 7, steps: [14] }
    ]
  },
  house: {
    // 4-on-the-floor kick with offbeat open-hat and snare on 2 and 4.
    kick: [0, 4, 8, 12],
    snare: [4, 12],
    hat: [2, 6, 10, 14],
    clap: [4, 12],
    perc: [6, 14],
    extras: [{ pad: 5, steps: [10] }]
  },
  'hip-hop': {
    // Boom-bap: kick on 1 and the "and" of 3; snare on 2 and 4; eighth-note hats.
    kick: [0, 10],
    snare: [4, 12],
    hat: [0, 2, 4, 6, 8, 10, 12, 14],
    clap: [4, 12],
    perc: [7, 15]
  },
  breakbeat: {
    // The "Amen" skeleton: syncopated kick and snare with busy hats.
    kick: [0, 4, 10],
    snare: [4, 10, 12],
    hat: [0, 2, 4, 6, 8, 10, 12, 14],
    clap: [4, 12],
    perc: [3, 7, 11, 15]
  },
  dembow: {
    // Reggaeton "dem bow" pattern. Kick + clap on the 3-3-2 cluster.
    kick: [0, 6, 8, 14],
    snare: [4, 12],
    hat: [2, 6, 10, 14],
    clap: [3, 7, 11, 15],
    perc: [1, 9]
  },
  afrobeat: {
    // Lightly skipping clave-ish pattern with offbeat hats.
    kick: [0, 6, 8],
    snare: [4, 12],
    hat: [1, 3, 5, 7, 9, 11, 13, 15],
    clap: [4, 12],
    perc: [2, 10, 14]
  }
};

export type GenrePatternId = 'techno' | 'house' | 'hip-hop' | 'breakbeat' | 'dembow' | 'afrobeat';

export interface GenrePattern {
  id: GenrePatternId;
  label: string;
  description: string;
}

export const GENRE_PATTERNS: GenrePattern[] = [
  {
    id: 'techno',
    label: 'Techno',
    description: 'Driving 4-on-the-floor with eighth-note hats and offbeat percussion.'
  },
  {
    id: 'house',
    label: 'House',
    description: '4-on-the-floor with offbeat hats and a punchy clap on 2 and 4.'
  },
  {
    id: 'hip-hop',
    label: 'Hip-hop',
    description: 'Boom-bap kick-on-1 plus syncopated snare and steady eighth hats.'
  },
  {
    id: 'breakbeat',
    label: 'Breakbeat',
    description: 'Syncopated kick and snare around the "Amen" skeleton.'
  },
  { id: 'dembow', label: 'Dembow', description: 'Reggaeton 3-3-2 cluster with offbeat claps.' },
  {
    id: 'afrobeat',
    label: 'Afrobeat',
    description: 'Clave-leaning kick with skipping offbeat hats.'
  }
];

export function createGenrePattern(
  slices: AudioSlice[],
  genre: GenrePatternId = 'techno'
): Pattern {
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

  const recipe = GENRE_RECIPES[genre];
  for (const step of recipe.kick) pattern[kick][step] = true;
  for (const step of recipe.snare) pattern[snare][step] = true;
  for (const step of recipe.hat) pattern[hat][step] = true;
  for (const step of recipe.clap) pattern[clap][step] = true;
  for (const step of recipe.perc) pattern[perc][step] = true;

  if (recipe.extras) {
    for (const extra of recipe.extras) {
      if (extra.pad < padCount) {
        for (const step of extra.steps) {
          pattern[extra.pad][step] = true;
        }
      }
    }
  }

  return pattern;
}

// Backwards-compatible alias: createTechnoPattern is still imported by older
// callers. New code should prefer createGenrePattern(slices, 'techno').
export function createTechnoPattern(slices: AudioSlice[]): Pattern {
  return createGenrePattern(slices, 'techno');
}

export function toggleStep(pattern: Pattern, padIndex: number, stepIndex: number): Pattern {
  return pattern.map((row, rowIndex) =>
    row.map((active, columnIndex) =>
      rowIndex === padIndex && columnIndex === stepIndex ? !active : active
    )
  );
}
