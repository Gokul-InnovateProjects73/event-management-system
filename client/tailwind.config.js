/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: 'rgba(var(--color-primary), 0.05)',
          100: 'rgba(var(--color-primary), 0.1)',
          200: 'rgba(var(--color-primary), 0.2)',
          300: 'rgba(var(--color-primary), 0.3)',
          400: 'rgba(var(--color-primary), 0.4)',
          500: 'rgb(var(--color-primary))',
          600: 'rgba(var(--color-primary), 0.9)',
          700: 'rgba(var(--color-primary), 0.8)',
          800: 'rgba(var(--color-primary), 0.7)',
          900: 'rgba(var(--color-primary), 0.6)',
        },
        dark: {
          900: 'rgb(var(--color-background))',
          800: 'rgba(var(--color-background), 0.9)',
          700: 'rgb(var(--color-card))',
          600: 'rgba(var(--color-card), 0.9)',
          500: 'rgba(var(--color-border), 0.1)',
          400: 'rgb(var(--color-border))',
          text: 'rgb(var(--color-text))',
          muted: 'rgb(var(--color-text-muted))',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
