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
          bg: 'var(--hf-bg)',
          card: 'var(--hf-card)',
          surface: 'var(--hf-surface)',
          text: 'var(--hf-text)',
          secondary: 'var(--hf-secondary)',
          border: 'var(--hf-border)',
          accent: '#007AFF',
          success: '#34C759',
          warning: '#FF9500',
          danger: '#FF3B30',
          sargent: '#D32F2F',
        },
      },
      borderRadius: {
        apple: '22px',
      },
      backdropBlur: {
        apple: '20px',
      },
    },
  },
  plugins: [],
};
