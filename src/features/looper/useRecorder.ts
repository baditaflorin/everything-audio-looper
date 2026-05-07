import { useRef, useState } from 'react';
import { downmixAudioBuffer } from '../audio/audioBufferUtils';
import { AppError, toAppError } from '../../shared/errors';

export type RecordedAudio = {
  samples: Float32Array;
  sampleRate: number;
  duration: number;
};

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | undefined>(undefined);
  const stream = useRef<MediaStream | undefined>(undefined);
  const chunks = useRef<Blob[]>([]);

  async function start() {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new AppError(
          'microphone_unavailable',
          'This browser does not expose microphone recording.',
          'Use the demo kit or try a modern Chromium, Firefox, or Safari browser.'
        );
      }

      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      chunks.current = [];
      mediaRecorder.current = new MediaRecorder(stream.current);
      mediaRecorder.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
        }
      });
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      throw toAppError(
        error,
        new AppError(
          'microphone_unavailable',
          'Microphone access failed.',
          'Check browser permissions or use the demo kit.'
        )
      );
    }
  }

  async function stop(): Promise<RecordedAudio> {
    const recorder = mediaRecorder.current;
    if (!recorder) {
      throw new AppError('recording_failed', 'No recording is active.', 'Start recording first.');
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      recorder.addEventListener(
        'stop',
        () => resolve(new Blob(chunks.current, { type: recorder.mimeType || 'audio/webm' })),
        { once: true }
      );
      recorder.addEventListener(
        'error',
        () => reject(new Error('MediaRecorder stopped with an error.')),
        {
          once: true
        }
      );
      recorder.stop();
    });

    stream.current?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioContext = new AudioContext();
      const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      const samples = downmixAudioBuffer(decoded);
      await audioContext.close();

      return {
        samples,
        sampleRate: decoded.sampleRate,
        duration: decoded.duration
      };
    } catch (error) {
      throw toAppError(
        error,
        new AppError(
          'decode_failed',
          'The recording could not be decoded.',
          'Try a shorter recording.'
        )
      );
    }
  }

  return {
    isRecording,
    start,
    stop
  };
}
