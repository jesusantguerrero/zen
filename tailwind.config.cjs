module.exports = {
  content: [
    './index.html', 
    './src/**/*.{vue,js,ts,jsx,tsx}', 
    './node_modules/atmosphere-ui/dist/**/*.{vue,js}', 
    './node_modules/vue-temporal-components/**/*.{vue,js}'
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "base-lvl-1": "#0F172A",
        "base-lvl-2": "#1E293B",
        "base-lvl-3": "#475569",
        "accent": "#00DC82",
        "error": "#F87171",
        "warning": "#FBBF24",
        "info": "#22D3EE",
        "body-1": "#ffffff"
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
}
