/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brazil-navy': '#002147',
        'brazil-green': {
          100: '#E8F5E8',
          200: '#C8E6C9',
          300: '#A5D6A7',
          400: '#81C784',
          500: '#66BB6A',
          600: '#4CAF50',
          700: '#43A047',
          800: '#388E3C',
          900: '#2E7D32',
        },
        'brazil-yellow': {
          100: '#FFF9C4',
          200: '#FFF59D',
          300: '#FFF176',
          400: '#FFEE58',
          500: '#FFEB3B',
          600: '#FDD835',
          700: '#FBC02D',
          800: '#F9A825',
          900: '#F57F17',
        }
      },
      backgroundImage: {
        'brazil-gradient': 'linear-gradient(135deg, #002147 0%, #1a365d 100%)',
      }
    },
  },
  plugins: [],
}
