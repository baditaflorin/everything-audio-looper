import { AppError } from '../../shared/errors';
import { createAudioBuffer } from './audioBufferUtils';
import type { DrumKit, Pattern } from './types';

type StepCallback = (step: number) => void;

export class WebAudioEngine {
  private context: AudioContext | undefined;
  private buffers: AudioBuffer[] = [];
  private timer: number | undefined;
  private nextStepTime = 0;
  private step = 0;
  private activePattern: Pattern = [];
  private bpm = 120;
  private onStep: StepCallback = () => undefined;

  async ensureContext() {
    this.context ??= new AudioContext();
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    return this.context;
  }

  async loadKit(kit: DrumKit) {
    const context = await this.ensureContext();
    this.bpm = kit.bpm;
    this.buffers = kit.slices.map((slice) =>
      createAudioBuffer(context, slice.samples, kit.sampleRate)
    );
  }

  setBpm(bpm: number) {
    this.bpm = bpm;
  }

  setStepCallback(callback: StepCallback) {
    this.onStep = callback;
  }

  async playPad(index: number, when?: number) {
    const context = await this.ensureContext();
    const buffer = this.buffers[index];
    if (!buffer) {
      throw new AppError(
        'playback_failed',
        'That pad is empty.',
        'Generate or restore a kit first.'
      );
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = 0.92;
    source.buffer = buffer;
    source.connect(gain).connect(context.destination);
    source.start(when ?? context.currentTime);
  }

  async start(pattern: Pattern) {
    const context = await this.ensureContext();
    this.stop(false);
    this.activePattern = pattern;
    this.step = 0;
    this.nextStepTime = context.currentTime + 0.05;
    this.timer = window.setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  stop(resetStep = true) {
    if (this.timer !== undefined) {
      window.clearInterval(this.timer);
      this.timer = undefined;
    }

    if (resetStep) {
      this.step = 0;
      this.onStep(-1);
    }
  }

  private schedule() {
    if (!this.context) return;

    const secondsPerStep = 60 / this.bpm / 4;
    while (this.nextStepTime < this.context.currentTime + 0.12) {
      const currentStep = this.step;
      this.activePattern.forEach((row, padIndex) => {
        if (row[currentStep]) {
          void this.playPad(padIndex, this.nextStepTime);
        }
      });

      window.setTimeout(
        () => this.onStep(currentStep),
        Math.max(0, (this.nextStepTime - this.context.currentTime) * 1000)
      );
      this.nextStepTime += secondsPerStep;
      this.step = (this.step + 1) % 16;
    }
  }
}
