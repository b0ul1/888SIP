/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          950: '#0a0016'
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace']
      }
    }
  },
  plugins: []
}
