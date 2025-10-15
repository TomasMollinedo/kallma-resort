import LogoKallma from '/src/assets/icono-kallma-blanco.svg';
import '../index.css';
import { Wind } from "lucide-react";

export default function Hero() {
  return (
    <section
       className="h-screen bg-cover bg-center relative font-kallma"
      style={{ backgroundImage: "url('/src/assets/fondo.jpg')" }}
    >
      {/* 1. Panel Izquierdo con Efecto Desenfoque y Oscurecimiento */}
      <div className="absolute top-0 left-0 w-[41.5%] h-full backdrop-blur-lg bg-black/30"></div>

      {/* 2. Contenido Principal: Logo, Título y Botón */}
      {/* El contenedor principal se centra verticalmente (top-1/2, transform -translate-y-1/2) 
        y se extiende horizontalmente a través de la sección para permitir que el título se divida.
      */}
      <div className="absolute inset-0 flex items-center justify-center text-white -translate-y-20">
        
        {/* Contenedor Flex para Título (completo) y Botón - Los alineamos para que el título esté centrado sobre la línea */}
        <div className="flex items-center" style={{ transform: 'translateX(-8%)' }}> {/* Ajuste manual para centrar el título */}
          
          {/* Logo Kallma - En el lado desenfocado */}
          <img src={LogoKallma} alt="Logo" className="w-28 h-28 mr-6 mb-2" />
          
          {/* Título Kallma (Dividido Visualmente) */}
          <h1 className="text-9xl font-bold flex whitespace-nowrap"> 
            {/* 'Kal' - Debe verse blanco/claro (en el lado desenfocado) */}
            <span className="text-white">Kal</span>
            {/* 'lma' - Debe verse borroso/oscuro (en el lado enfocado) */}
            <span className="text-gray-800/60">lma</span>
          </h1>

          {/* Botón "Reservar ahora" - Al lado del título, en el lado enfocado */}
          <button 
            className="flex items-center ml-10 mt-[28px] bg-gray-600/70 hover:bg-gray-500/80 text-white font-medium px-6 py-3 rounded-full shadow-xl hover:shadow-2xl transition duration-300"
            style={{ width: '200px', height: '50px' }}
          >
            Reservar ahora
            <span className="ml-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
            </span>
          </button>
        </div>
      </div>
      
       {/* Slogan */}
    <div className="absolute bottom-32 left-24 ml-6 flex items-end space-x-3 text-xl font-semibold">
      <div className="flex flex-col leading-snug">
        <span className="text-gray-200">Cabañas Kallma: descanso en </span>
        <span className="text-gray-200">la nieve, paz en cada detalle.</span>
      </div>
      <Wind className="w-10 h-10 text-gray-200" />
    </div>

    </section>
  )
}
