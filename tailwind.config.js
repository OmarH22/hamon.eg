/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hamon: {
          black:   '#060606',
          charcoal:'#2B2B2B',
          bg:      '#F7F7F5',
          silver:  '#C0C0C0',
          gold:    '#C9A96E',
        }
      },
    },
  },
  plugins: [],
}
