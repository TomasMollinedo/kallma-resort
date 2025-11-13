import { useEffect, useState } from "react";

/**
 * Renderiza copos de nieve animados que caen de inmediato al ingresar al sitio.
 * @returns {JSX.Element} Capa visual con copos de nieve animados.
 */
export default function Snowfall() {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const generateSnowflakes = () => {
      const flakes = [];
      for (let i = 0; i < 80; i++) {
        const animationDuration = Math.random() * 5 + 5;
        flakes.push({
          id: i,
          left: Math.random() * 100,
          animationDuration,
          opacity: Math.random() * 0.6 + 0.4,
          size: Math.random() * 6 + 3,
          animationDelay: -Math.random() * animationDuration, // arranca en pleno descenso
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
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            willChange: "transform",
          }}
        >
          <div className="w-full h-full bg-white rounded-full shadow-sm" />
        </div>
      ))}
    </div>
  );
}
