import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify('0.1.0'),
    __GIT_COMMIT__: JSON.stringify('test'),
    __BUILT_AT__: JSON.stringify('2026-05-08T00:00:00.000Z'),
    __REPOSITORY_URL__: JSON.stringify('https://github.com/baditaflorin/everything-audio-looper'),
    __PAYPAL_URL__: JSON.stringify('https://www.paypal.com/paypalme/florinbadita')
  },
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['node_modules/**', 'docs/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: [
        'src/features/audio/audioAnalysis.ts',
        'src/features/audio/audioBufferUtils.ts',
        'src/features/audio/demoKit.ts',
        'src/features/audio/ids.ts',
        'src/features/audio/loopPattern.ts',
        'src/shared/version.ts'
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 55,
        statements: 70
      }
    }
  }
});
