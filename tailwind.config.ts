import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10141f',
        panel: '#171d2c',
        line: '#2b3448',
        mint: '#64e0b8',
        coral: '#ff7f6e',
        amber: '#f7c948',
        sky: '#7dd3fc'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      boxShadow: {
        glow: '0 18px 60px rgba(100, 224, 184, 0.16)'
      }
    }
  },
  plugins: []
} satisfies Config;
