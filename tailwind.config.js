/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F5EDE3',
          50: '#FAF5EE',
          100: '#F5EDE3',
          200: '#EDE0D2',
          300: '#DFCEBD',
        },
        espresso: {
          DEFAULT: '#1E1714',
          light: '#2A201C',
          dark: '#140F0D',
        },
        caramel: {
          DEFAULT: '#8B5A2B',
          light: '#A66E38',
          dark: '#6F451F',
        },
        muted: {
          DEFAULT: '#5A4A40',
          light: '#766458',
          dark: '#43362E',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        script: ['"Alex Brush"', '"Caveat"', 'cursive'],
      },
    },
  },
  plugins: [],
}
