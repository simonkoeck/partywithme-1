module.exports = {
  content: [
    'apps/web/pages/**/*.{js,ts,jsx,tsx}',
    'apps/web/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
      },
    },
    fontFamily: {
      default: ['"Inter"', 'sans-serif'],
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
