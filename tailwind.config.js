/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Iowan Old Style', "serif"]
      },
      fontSize: {
        '2xs': '5px'
      }

    },
    plugins: [],
  }
}