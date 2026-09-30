/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        starz: {
          red: '#D8232A',
          'red-dark': '#B01920',
          blue: '#1A42B8',
          'blue-dark': '#0F215A',
          navy: '#0A1432',
        }
      }
    },
  },
  plugins: [],
}
