import { useEffect, useRef } from 'react';
import type { Onset } from '../audio/types';

type Props = {
  samples: Float32Array | undefined;
  onsets: Onset[];
  activeStep: number;
};

export function WaveformCanvas({ samples, onsets, activeStep }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    context.scale(ratio, ratio);
    context.clearRect(0, 0, rect.width, rect.height);

    context.fillStyle = '#10141f';
    context.fillRect(0, 0, rect.width, rect.height);

    if (!samples?.length) {
      drawEmpty(context, rect.width, rect.height);
      return;
    }

    const middle = rect.height / 2;
    const samplesPerPixel = Math.max(1, Math.floor(samples.length / rect.width));

    context.strokeStyle = '#64e0b8';
    context.lineWidth = 1.5;
    context.beginPath();
    for (let x = 0; x < rect.width; x += 1) {
      const start = x * samplesPerPixel;
      const end = Math.min(samples.length, start + samplesPerPixel);
      let min = 0;
      let max = 0;
      for (let index = start; index < end; index += 1) {
        min = Math.min(min, samples[index]);
        max = Math.max(max, samples[index]);
      }
      context.moveTo(x, middle + min * middle * 0.82);
      context.lineTo(x, middle + max * middle * 0.82);
    }
    context.stroke();

    context.fillStyle = '#ff7f6e';
    for (const onset of onsets) {
      const x = (onset.sampleIndex / samples.length) * rect.width;
      context.fillRect(x, 10, 2, rect.height - 20);
    }

    if (activeStep >= 0) {
      context.fillStyle = 'rgba(247, 201, 72, 0.18)';
      context.fillRect((activeStep / 16) * rect.width, 0, rect.width / 16, rect.height);
    }
  }, [activeStep, onsets, samples]);

  return (
    <canvas
      ref={ref}
      aria-label="Waveform with detected transients"
      className="h-44 w-full rounded-md border border-line bg-ink"
    />
  );
}

function drawEmpty(context: CanvasRenderingContext2D, width: number, height: number) {
  context.strokeStyle = '#2b3448';
  context.lineWidth = 1;
  for (let x = 0; x < width; x += 18) {
    const y = height / 2 + Math.sin(x / 19) * 18;
    context.beginPath();
    context.arc(x, y, 1.5, 0, Math.PI * 2);
    context.stroke();
  }
}
