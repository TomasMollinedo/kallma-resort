import { useEffect, useState } from 'react';

/**
 * Componente que genera una animación sutil de copos de nieve cayendo
 * Los copos tienen diferentes tamaños, velocidades y opacidades para un efecto natural
 * @returns {JSX.Element} Contenedor con animación de nieve
 */
export default function Snowfall() {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    /**
     * Genera un array de copos de nieve con propiedades aleatorias
     * Cada copo tiene posición, tamaño, duración de animación y retraso únicos
     */
    const generateSnowflakes = () => {
      const flakes = [];
      // Generar 50 copos de nieve
      for (let i = 0; i < 50; i++) {
        flakes.push({
          id: i,
          left: Math.random() * 100, // Posición horizontal aleatoria (0-100%)
          animationDuration: Math.random() * 3 + 5, // Duración entre 5-8 segundos
          opacity: Math.random() * 0.3 + 0.1, // Opacidad entre 0.1-0.4 para sutileza
          size: Math.random() * 3 + 2, // Tamaño entre 2-5px
          animationDelay: Math.random() * 5, // Retraso inicial aleatorio
        });
      }
      setSnowflakes(flakes);
    };

    generateSnowflakes();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute top-0 animate-snowfall"
          style={{
            left: `${flake.left}%`,
            opacity: flake.opacity,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
          }}
        >
          {/* Copo de nieve con forma circular y blur sutil */}
          <div className="w-full h-full bg-white rounded-full blur-[0.5px]" />
        </div>
      ))}
    </div>
  );
}
