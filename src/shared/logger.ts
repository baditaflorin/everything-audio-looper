const isDevelopment = import.meta.env.DEV;

export const logger = {
  debug(message: string, data?: unknown) {
    if (isDevelopment) {
      console.debug(`[everything-audio-looper] ${message}`, data ?? '');
    }
  },
  warn(message: string, data?: unknown) {
    console.warn(`[everything-audio-looper] ${message}`, data ?? '');
  },
  error(message: string, data?: unknown) {
    console.error(`[everything-audio-looper] ${message}`, data ?? '');
  }
};
