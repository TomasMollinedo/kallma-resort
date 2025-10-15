import { Link } from 'react-router-dom';
import React from 'react';

export default function CabanaCard({ cabana, isFlipped, onFlip }) {
  return (
    <div
      className={`relative w-full h-[450px] cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
        isFlipped ? 'rotate-y-180' : ''
      }`}
      onClick={onFlip}
    >
      {/* Frente */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg backface-hidden border border-gray-700">
        <img
          src={cabana.imagen}
          alt={cabana.titulo}
          className="w-full h-full object-cover brightness-90 hover:brightness-100 transition"
        />
        <div className="absolute bottom-0 w-full bg-white/70 backdrop-blur-md p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">{cabana.titulo}</h2>
          <p className="text-xs text-gray-500 mt-2 text-right select-none">
            Mostrar más información →
          </p>
        </div>
      </div>

      {/* Reverso */}
      <div className="absolute inset-0 bg-white/90 text-gray-900 rounded-lg shadow-xl overflow-hidden backface-hidden rotate-y-180 backdrop-blur-md border border-gray-600 p-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">{cabana.titulo}</h2>
          <p className="text-sm mb-3 border-b border-gray-300/30 pb-3">
            {cabana.caracteristicas}
          </p>
          <p className="text-sm font-bold text-orange-500">${cabana.precio}</p>
          <ul className="text-sm space-y-1">
            <li>
              <strong>Capacidad:</strong> {cabana.capacidad}
            </li>
            <li className="font-semibold mt-2">Comodidades:</li>
            {cabana.comodidades.map((c, index) => (
              <li key={index} className="ml-4 list-disc text-gray-600 dark:text-gray-600">
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button className="text-sm text-gray-500 hover:text-orange-500 transition">
            ← Volver
          </button>
          <Link
            to={`/reservar?cabana=${cabana.slug}`}
            className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-semibold hover:bg-orange-400 transition"
          >
            Reservar
          </Link>
        </div>
      </div>
    </div>
  );
}

