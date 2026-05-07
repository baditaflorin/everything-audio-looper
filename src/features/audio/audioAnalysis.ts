import { nanoid } from './ids';
import { runLibrosaAnalysis } from './librosaAnalyzerClient';
import type { AnalysisResult, AnalyzerMode, AudioSlice, Onset, SliceRole } from './types';
import { applyTinyFade } from './audioBufferUtils';

const LABELS = [
  'Kick',
  'Snare',
  'Hat',
  'Clap',
  'Rim',
  'Tick',
  'Thump',
  'Tap',
  'Click',
  'Noise',
  'Pop',
  'Knock',
  'Shaker',
  'Block',
  'Zap',
  'Ghost'
];

const COLORS = ['#64e0b8', '#ff7f6e', '#f7c948', '#7dd3fc', '#c4b5fd'];

export async function analyzeRecording(
  samples: Float32Array,
  sampleRate: number,
  mode: AnalyzerMode
): Promise<AnalysisResult> {
  if (mode === 'librosa-wasm') {
    try {
      const wasmResult = await runLibrosaAnalysis(samples, sampleRate);
      return createAnalysisResult(
        samples,
        sampleRate,
        wasmResult.onsets,
        wasmResult.bpm,
        'librosa-wasm'
      );
    } catch (error) {
      const fallback = analyzeWithTypeScript(samples, sampleRate);
      return {
        ...fallback,
        warning:
          error instanceof Error
            ? `Librosa WASM could not initialize, so the fast local analyzer was used. ${error.message}`
            : 'Librosa WASM could not initialize, so the fast local analyzer was used.'
      };
    }
  }

  return analyzeWithTypeScript(samples, sampleRate);
}

export function analyzeWithTypeScript(samples: Float32Array, sampleRate: number): AnalysisResult {
  const envelope = buildOnsetEnvelope(samples, sampleRate);
  const onsets = pickOnsets(envelope, samples, sampleRate);
  const repairedOnsets = ensureMinimumOnsets(onsets, samples, sampleRate, 8);
  const bpm = estimateBpm(repairedOnsets);

  return createAnalysisResult(samples, sampleRate, repairedOnsets, bpm, 'fast-js');
}

export function createAnalysisResult(
  samples: Float32Array,
  sampleRate: number,
  onsets: Onset[],
  bpm: number,
  analyzer: AnalyzerMode
): AnalysisResult {
  const normalizedOnsets = onsets
    .filter((onset) => onset.sampleIndex >= 0 && onset.sampleIndex < samples.length)
    .sort((a, b) => a.sampleIndex - b.sampleIndex);

  return {
    bpm: clampBpm(bpm),
    onsets: normalizedOnsets,
    slices: sliceOnsets(samples, sampleRate, normalizedOnsets),
    analyzer
  };
}

type EnvelopeFrame = {
  index: number;
  sampleIndex: number;
  value: number;
};

export function buildOnsetEnvelope(samples: Float32Array, sampleRate: number): EnvelopeFrame[] {
  const frameSize = Math.max(512, Math.floor(sampleRate * 0.021));
  const hopSize = Math.max(128, Math.floor(frameSize / 4));
  const frames: EnvelopeFrame[] = [];
  let previousEnergy = 0;

  for (
    let start = 0, frameIndex = 0;
    start + frameSize < samples.length;
    start += hopSize, frameIndex += 1
  ) {
    let energy = 0;
    let highFrequencyWeight = 0;

    for (let offset = 0; offset < frameSize; offset += 1) {
      const current = samples[start + offset];
      const previous = offset > 0 ? samples[start + offset - 1] : 0;
      energy += current * current;
      highFrequencyWeight += Math.abs(current - previous);
    }

    const rms = Math.sqrt(energy / frameSize);
    const transientEnergy = Math.max(0, rms - previousEnergy);
    previousEnergy = rms * 0.82 + previousEnergy * 0.18;

    frames.push({
      index: frameIndex,
      sampleIndex: start,
      value: transientEnergy * 0.72 + (highFrequencyWeight / frameSize) * 0.28
    });
  }

  return smoothEnvelope(frames);
}

function smoothEnvelope(frames: EnvelopeFrame[]) {
  return frames.map((frame, index) => {
    const previous = frames[Math.max(0, index - 1)]?.value ?? frame.value;
    const next = frames[Math.min(frames.length - 1, index + 1)]?.value ?? frame.value;
    return {
      ...frame,
      value: frame.value * 0.6 + previous * 0.2 + next * 0.2
    };
  });
}

export function pickOnsets(
  envelope: EnvelopeFrame[],
  samples: Float32Array,
  sampleRate: number
): Onset[] {
  if (envelope.length === 0) {
    return [];
  }

  const values = envelope.map((frame) => frame.value).sort((a, b) => a - b);
  const median = values[Math.floor(values.length / 2)] ?? 0;
  const high = values[Math.floor(values.length * 0.88)] ?? median;
  const threshold = median + (high - median) * 0.36;
  const minSpacing = Math.floor(sampleRate * 0.08);
  const picked: Onset[] = [];

  for (let index = 1; index < envelope.length - 1; index += 1) {
    const frame = envelope[index];
    const isPeak =
      frame.value > threshold &&
      frame.value >= envelope[index - 1].value &&
      frame.value >= envelope[index + 1].value;
    const last = picked[picked.length - 1];

    if (!isPeak || (last && frame.sampleIndex - last.sampleIndex < minSpacing)) {
      if (isPeak && last && frame.value > last.strength) {
        picked[picked.length - 1] = frameToOnset(frame, samples, sampleRate);
      }
      continue;
    }

    picked.push(frameToOnset(frame, samples, sampleRate));
  }

  return picked.slice(0, 24);
}

function frameToOnset(frame: EnvelopeFrame, samples: Float32Array, sampleRate: number): Onset {
  const searchEnd = Math.min(samples.length, frame.sampleIndex + Math.floor(sampleRate * 0.035));
  let peakSample = frame.sampleIndex;
  let peak = 0;

  for (let index = frame.sampleIndex; index < searchEnd; index += 1) {
    const value = Math.abs(samples[index]);
    if (value > peak) {
      peak = value;
      peakSample = index;
    }
  }

  return {
    sampleIndex: peakSample,
    time: peakSample / sampleRate,
    strength: frame.value
  };
}

export function ensureMinimumOnsets(
  onsets: Onset[],
  samples: Float32Array,
  sampleRate: number,
  minimum: number
) {
  if (onsets.length >= minimum || samples.length === 0) {
    return onsets;
  }

  const duration = samples.length / sampleRate;
  const repaired = [...onsets];
  const chunkCount = Math.min(minimum, Math.max(1, Math.floor(duration / 0.16)));

  for (let chunk = 0; chunk < chunkCount; chunk += 1) {
    const start = Math.floor((chunk / chunkCount) * samples.length);
    const end = Math.min(samples.length, Math.floor(((chunk + 1) / chunkCount) * samples.length));
    let peakIndex = start;
    let peak = 0;

    for (let index = start; index < end; index += 1) {
      const value = Math.abs(samples[index]);
      if (value > peak) {
        peak = value;
        peakIndex = index;
      }
    }

    const tooClose = repaired.some(
      (onset) => Math.abs(onset.sampleIndex - peakIndex) < sampleRate * 0.06
    );
    if (!tooClose && peak > 0.01) {
      repaired.push({
        sampleIndex: peakIndex,
        time: peakIndex / sampleRate,
        strength: peak
      });
    }
  }

  return repaired.sort((a, b) => a.sampleIndex - b.sampleIndex).slice(0, 24);
}

export function estimateBpm(onsets: Onset[]) {
  const intervals: number[] = [];

  for (let index = 1; index < onsets.length; index += 1) {
    const interval = onsets[index].time - onsets[index - 1].time;
    if (interval >= 0.18 && interval <= 1.6) {
      intervals.push(interval);
    }
  }

  if (intervals.length === 0) {
    return 120;
  }

  const bpms = intervals.map((interval) => normalizeBpm(60 / interval)).sort((a, b) => a - b);
  return bpms[Math.floor(bpms.length / 2)] ?? 120;
}

function normalizeBpm(bpm: number) {
  let normalized = bpm;
  while (normalized < 82) normalized *= 2;
  while (normalized > 178) normalized /= 2;
  return normalized;
}

function clampBpm(bpm: number) {
  if (!Number.isFinite(bpm)) {
    return 120;
  }

  return Math.round(Math.min(180, Math.max(80, bpm)));
}

export function sliceOnsets(samples: Float32Array, sampleRate: number, onsets: Onset[]) {
  const slices: AudioSlice[] = [];
  const maxLength = Math.floor(sampleRate * 0.52);
  const minLength = Math.floor(sampleRate * 0.08);
  const preRoll = Math.floor(sampleRate * 0.006);

  for (let index = 0; index < Math.min(onsets.length, 16); index += 1) {
    const onset = onsets[index];
    const nextOnset = onsets[index + 1]?.sampleIndex ?? samples.length;
    const start = Math.max(0, onset.sampleIndex - preRoll);
    const naturalEnd = Math.max(
      start + minLength,
      Math.min(nextOnset - preRoll, start + maxLength)
    );
    const end = Math.min(samples.length, naturalEnd);
    const raw = samples.slice(start, end);
    const peak = findPeak(raw);

    if (raw.length >= minLength / 2 && peak > 0.006) {
      slices.push({
        id: nanoid(),
        label: LABELS[index] ?? `Pad ${index + 1}`,
        role: roleForSlice(index, raw, peak),
        color: COLORS[index % COLORS.length],
        startSample: start,
        endSample: end,
        peak,
        samples: applyTinyFade(raw, sampleRate)
      });
    }
  }

  return slices;
}

function findPeak(samples: Float32Array) {
  let peak = 0;
  for (const sample of samples) {
    peak = Math.max(peak, Math.abs(sample));
  }
  return peak;
}

function roleForSlice(index: number, samples: Float32Array, peak: number): SliceRole {
  const zeroCrossings = countZeroCrossings(samples);
  const density = zeroCrossings / Math.max(1, samples.length);

  if (index === 0 || (index % 4 === 0 && peak > 0.72 && density < 0.08)) return 'kick';
  if (density > 0.24) return 'hat';
  if (index === 1 || index === 5) return 'snare';
  if (index === 2 || index === 6) return 'clap';
  return 'perc';
}

function countZeroCrossings(samples: Float32Array) {
  let crossings = 0;
  for (let index = 1; index < samples.length; index += 1) {
    if (
      (samples[index - 1] <= 0 && samples[index] > 0) ||
      (samples[index - 1] >= 0 && samples[index] < 0)
    ) {
      crossings += 1;
    }
  }
  return crossings;
}
