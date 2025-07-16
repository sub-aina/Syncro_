/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    '[transform-style:preserve-3d]',
    '[--cube-face-border]',
    '[--cube-face-bg]',
    '[--cube-face-shadow]',
    'aspect-square',
    'cube',
    'cube-face',
    'grid',
    'relative',
    'absolute',
    'inset-0',
    'pointer-events-none',
    '-inset-9',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
