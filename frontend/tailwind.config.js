/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#FFB800",
          "primary-focus": "#F2A900",
        },
        synthwave: {
          ...require("daisyui/src/theming/themes")["synthwave"],
          primary: "#FFB800",
          "primary-focus": "#F2A900",
        },
      },
    ],
  },
}
