/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        kallma: ['Lora', 'serif'],
        lexend: ['Lexend', 'sans-serif'],
      },
      animation: {
        snowfall: 'snowfall 12s linear infinite',       
        fadeIn: 'fadeIn 0.3s ease-in-out',     
      },
      keyframes: {
        snowfall: {
          '0%': {
            transform: 'translateY(-10px) translateX(0)',
            opacity: '0.8',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(100vh) translateX(30px)',
            opacity: '0.2',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
