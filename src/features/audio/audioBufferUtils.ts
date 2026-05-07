import { AppError } from '../../shared/errors';

export function downmixAudioBuffer(buffer: AudioBuffer): Float32Array {
  if (buffer.length === 0) {
    throw new AppError(
      'decode_failed',
      'The recording did not contain audio.',
      'Try recording again.'
    );
  }

  const output = new Float32Array(buffer.length);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      output[index] += data[index] / buffer.numberOfChannels;
    }
  }

  return normalizeSamples(output);
}

export function normalizeSamples(samples: Float32Array) {
  let peak = 0;
  for (const sample of samples) {
    peak = Math.max(peak, Math.abs(sample));
  }

  if (peak <= 0.001) {
    return samples.slice();
  }

  const gain = Math.min(1 / peak, 3);
  const normalized = new Float32Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    normalized[index] = samples[index] * gain;
  }
  return normalized;
}

export function createAudioBuffer(
  audioContext: BaseAudioContext,
  samples: Float32Array,
  sampleRate: number
) {
  const buffer = audioContext.createBuffer(1, samples.length, sampleRate);
  buffer.copyToChannel(samples as Float32Array<ArrayBuffer>, 0);
  return buffer;
}

export function applyTinyFade(samples: Float32Array, sampleRate: number) {
  const faded = samples.slice();
  const fadeLength = Math.min(Math.floor(sampleRate * 0.006), Math.floor(faded.length / 4));

  for (let index = 0; index < fadeLength; index += 1) {
    const gainIn = index / fadeLength;
    const gainOut = (fadeLength - index) / fadeLength;
    faded[index] *= gainIn;
    faded[faded.length - fadeLength + index] *= gainOut;
  }

  return faded;
}
