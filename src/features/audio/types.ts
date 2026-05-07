export type AnalyzerMode = 'fast-js' | 'librosa-wasm';

export type SliceRole = 'kick' | 'snare' | 'hat' | 'clap' | 'perc';

export type Onset = {
  sampleIndex: number;
  time: number;
  strength: number;
};

export type AudioSlice = {
  id: string;
  label: string;
  role: SliceRole;
  color: string;
  startSample: number;
  endSample: number;
  peak: number;
  samples: Float32Array;
};

export type DrumKit = {
  id: string;
  name: string;
  source: 'recording' | 'demo' | 'restored';
  analyzer: AnalyzerMode;
  createdAt: string;
  sampleRate: number;
  duration: number;
  bpm: number;
  onsets: Onset[];
  slices: AudioSlice[];
  sourceSamples: Float32Array;
};

export type AnalysisResult = {
  bpm: number;
  onsets: Onset[];
  slices: AudioSlice[];
  analyzer: AnalyzerMode;
  warning?: string;
};

export type Pattern = boolean[][];
