/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#F5F5F7',
          card: 'rgba(255, 255, 255, 0.7)',
          text: '#1D1D1F',
          secondary: '#86868B',
          accent: '#007AFF',
          success: '#34C759',
          warning: '#FF9500',
          danger: '#FF3B30',
          sargent: '#D32F2F', // A deep aggressive red for Sargent mode
        },
      },
      borderRadius: {
        'apple': '22px', // HIG standard for large cards
      },
      backdropBlur: {
        apple: '20px',
      },
    },
  },
  plugins: [],
}
