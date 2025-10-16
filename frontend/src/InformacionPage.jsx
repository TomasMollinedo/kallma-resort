import React from "react";
import fondo from "./assets/fondoinfo.svg"; 

export default function InfoPage() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white"
      style={{
        backgroundImage: `url(${fondo})`,
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <h1 className="relative text-6xl md:text-9xl font-bold tracking-wide mb-16 text-white/50">
        Kallma
      </h1>
      <div className="relative max-w-4xl w-full px-6 py-8 bg-white/10 backdrop-blur-md rounded-2xl text-center shadow-lg">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">Misión</h2>
            <p className="text-sm text-white/90">
              Brindar experiencias únicas de descanso y conexión con la
              naturaleza en un entorno sostenible.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Visión</h2>
            <p className="text-sm text-white/90">
              Ser el refugio natural preferido por quienes buscan paz y
              armonía con el entorno.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Valores</h2>
            <p className="text-sm text-white/90">
              Respeto, hospitalidad y compromiso con el bienestar y la
              naturaleza.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
