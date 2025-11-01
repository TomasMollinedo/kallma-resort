import React, { useState } from 'react';
import CabanaCard from './CabanasasCard';
import { cabanas } from './CabanasData';
import Fondo from '../assets/fondo.jpg'; 

export default function CabanasPage() {
  const [flippedCard, setFlippedCard] = useState(null);

  const handleFlip = (slug) => {
    setFlippedCard(flippedCard === slug ? null : slug);
  };

  return (
    <div className="relative min-h-screen pt-24 font-[Lora] bg-gradient-to-b from-[#f6e4da] to-[#e6cbb3]">
      {/* Fondo borroso */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${Fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      ></div>

      {/* Contenido nítido encima */}
      <div className="relative z-10">
        {/* -------------------- SECCIÓN TÍTULO -------------------- */}
        <div className="relative w-full flex flex-col items-center text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-2">
            Nuestras cabañas <span className="text-3xl">*</span>
          </h1>
          <p className="text-gray-600 text-lg font-light">Elegí la tuya y descubrí la magia de la montaña</p>
        </div>

        {/* -------------------- SECCIÓN TARJETAS -------------------- */}
        <div className="container mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {cabanas.map((cabana) => (
              <div key={cabana.slug} className="perspective-1000">
                <CabanaCard
                  cabana={cabana}
                  isFlipped={flippedCard === cabana.slug}
                  onFlip={() => handleFlip(cabana.slug)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


