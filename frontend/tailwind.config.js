/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#fff7fb',
          100: '#f2ddf2',
          400: '#b875b8',
          500: '#9c5c9c',
          600: '#7f437f',
          900: '#4f2a4f',
        },
        surface: {
          DEFAULT: '#fff9fd',
          card: '#ffffff',
          elevated: '#f8eef8',
          border: '#ead7ea',
        }
      }
    }
  },
  plugins: [],
}
