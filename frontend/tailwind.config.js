/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        // La utilidad será 'font-kallma'
        // El nombre real de la fuente es 'Lora'
        kallma: ['Lora', 'serif'], 
      },
    },
  },
  plugins: [],
}