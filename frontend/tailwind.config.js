module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        psa: {
          blue: '#003DA5',
          lightblue: '#0066CC',
          navy: '#001F3F',
          gray: '#6B7280'
        }
      }
    },
  },
  plugins: [],
}
