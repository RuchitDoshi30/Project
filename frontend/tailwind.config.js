/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '475px',
      },
      colors: {
        // LeetCode-inspired color scheme
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        difficulty: {
          easy: '#00b8a3',
          medium: '#ffc01e',
          hard: '#ef4743',
        },
        // LeetCode dark mode palette
        lc: {
          bg: '#1a1a1a',
          card: '#282828',
          elevated: '#333333',
          border: '#3e3e3e',
          'border-light': '#4a4a4a',
          text: '#eff1f6',
          'text-secondary': '#b3b3b3',
          'text-muted': '#a3a3a3',
          hover: '#ffffff0d',
        },
        // LeetCode accent (signature amber-orange)
        accent: {
          50: '#fff8eb',
          100: '#ffecc6',
          200: '#ffdb8a',
          300: '#ffc94d',
          400: '#ffb620',
          500: '#ffa116',
          600: '#e08a00',
          700: '#b86e00',
          800: '#965a00',
          900: '#7a4a00',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'card-hover':
          '0 14px 28px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
