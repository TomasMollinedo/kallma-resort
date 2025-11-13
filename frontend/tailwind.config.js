/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        // La utilidad será 'font-kallma'
        // El nombre real de la fuente es 'Lora'
        kallma: ['Lora', 'serif'],
        // Fuente Lexend para el header y elementos de la UI
        lexend: ['Lexend', 'sans-serif'],
      },
      animation: {
        // Animación de caída de nieve
        snowfall: 'snowfall linear infinite',
        // Animación de fade in para el overlay del menú mobile
        fadeIn: 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        // Define el movimiento de caída de los copos de nieve
        snowfall: {
          '0%': {
            transform: 'translateY(-10px) translateX(0)',
          },
          '100%': {
            transform: 'translateY(100vh) translateX(20px)',
          },
        },
        // Define la aparición gradual del overlay
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}