import LogoKallma from '/src/assets/icono-kallma-blanco.svg';
import '../index.css';

export default function Hero() {
  const slogan = "Cabañas Kallma: descanso en la nieve, paz en cada detalle.";

  return (
    <section
       className="h-screen bg-cover bg-center relative font-kallma"
      style={{ backgroundImage: "url('/src/assets/fondo.jpg')" }}
    >
      {/* 1. Panel Izquierdo con Efecto Desenfoque y Oscurecimiento */}
      <div className="absolute top-0 left-0 w-1/2 h-full backdrop-blur-lg bg-black/30"></div>

      {/* 2. Contenido Principal: Logo, Título y Botón */}
      {/* El contenedor principal se centra verticalmente (top-1/2, transform -translate-y-1/2) 
        y se extiende horizontalmente a través de la sección para permitir que el título se divida.
      */}
      <div className="absolute inset-0 flex items-center justify-center text-white">
        
        {/* Contenedor Flex para Título (completo) y Botón - Los alineamos para que el título esté centrado sobre la línea */}
        <div className="flex items-center" style={{ transform: 'translateX(11%)' }}> {/* Ajuste manual para centrar el título */}
          
          {/* Logo Kallma - En el lado desenfocado */}
          <img src={LogoKallma} alt="Logo" className="w-20 h-20 mr-4" /> 
          
          {/* Título Kallma (Dividido Visualmente) */}
          <h1 className="text-8xl font-bold flex whitespace-nowrap"> 
            {/* 'Kal' - Debe verse blanco/claro (en el lado desenfocado) */}
            <span className="text-white">Kal</span>
            {/* 'lma' - Debe verse borroso/oscuro (en el lado enfocado) */}
            <span className="text-gray-800/60">lma</span>
          </h1>

          {/* Botón "Reservar ahora" - Al lado del título, en el lado enfocado */}
          <button 
            className="flex items-center ml-10 bg-gray-600/70 hover:bg-gray-500/80 text-white font-medium px-6 py-3 rounded-full shadow-lg transition duration-300"
            style={{ width: '180px', height: '50px' }}
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
      
      {/* 3. Slogan en la esquina inferior izquierda (en el panel desenfocado) */}
      <div className="absolute bottom-6 left-10 text-white text-lg w-1/2 pr-12 flex flex-col items-start space-y-2">
        
        {/* Slogan principal */}
        <p className="ml-6 text-2xl font-semibold flex items-center">
            {slogan}
            <span className="ml-2 text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </span>
        </p>
      </div>

    </section>
  )
}



