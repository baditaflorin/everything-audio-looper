export type ErrorCode =
  | 'microphone_unavailable'
  | 'recording_failed'
  | 'decode_failed'
  | 'analysis_failed'
  | 'storage_failed'
  | 'playback_failed';

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly recovery: string;

  constructor(code: ErrorCode, message: string, recovery: string, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.recovery = recovery;

    if (cause instanceof Error) {
      this.stack = `${this.stack ?? ''}\nCaused by: ${cause.stack ?? cause.message}`;
    }
  }
}

export function toAppError(error: unknown, fallback: AppError): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(fallback.code, error.message || fallback.message, fallback.recovery, error);
  }

  return fallback;
}
