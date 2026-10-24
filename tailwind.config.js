/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0b1220',
          800: '#0f1a2e',
          700: '#14233d',
          600: '#1b2f4e',
        },
        brand: {
          50: '#ecfdf8',
          100: '#d1faec',
          200: '#a7f3da',
          300: '#6ee7c2',
          400: '#34d3a8',
          500: '#10b894',
          600: '#059477',
          700: '#04785f',
          800: '#065f4d',
          900: '#064f3f',
        },
        accent: {
          500: '#2f6df6',
          600: '#1e54d6',
        },
        slate: {
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.05)',
        card: '0 1px 3px 0 rgba(15,23,42,0.05), 0 4px 20px -4px rgba(15,23,42,0.08)',
        pop: '0 12px 40px -8px rgba(15,23,42,0.22)',
        glow: '0 0 0 1px rgba(16,184,148,0.1), 0 4px 24px -6px rgba(16,184,148,0.25)',
        'glow-blue': '0 0 0 1px rgba(47,109,246,0.1), 0 4px 24px -6px rgba(47,109,246,0.2)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        fadein: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slidein: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        scalein: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        drawline: {
          from: { strokeDashoffset: '200' },
          to: { strokeDashoffset: '0' },
        },
        slideup: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseglow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        fadein: 'fadein 0.25s ease-out',
        slidein: 'slidein 0.3s cubic-bezier(0.16,1,0.3,1)',
        scalein: 'scalein 0.2s ease-out',
        shimmer: 'shimmer 1.4s infinite',
        drawline: 'drawline 0.8s ease-out forwards',
        slideup: 'slideup 0.3s ease-out',
        pulseglow: 'pulseglow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
