import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LogoKallma from '/src/assets/icono-kallma-blanco.svg';
import './index.css';
import { Wind } from "lucide-react";
import Snowfall from "./components/Snowfall";

export default function Hero() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = "a5bb75fd213c4e058dd202412250710";
    const city = "Ushuaia";
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&lang=es`;

    axios.get(url)
      .then((res) => setWeather(res.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section
      className="h-screen bg-cover bg-center relative font-kallma"
      style={{ backgroundImage: "url('/src/assets/fondo.jpg')" }}
    >
      {/* Animación de nieve */}
      <Snowfall />
      {/* Panel desenfocado */}
      <div className="hidden lg:block absolute top-0 left-0 w-[41.5%] h-full backdrop-blur-lg bg-black/30"></div>

      {/* Contenido principal - Mobile/Tablet */}
      <div className="lg:hidden absolute inset-0 flex items-center justify-center text-gray-800/60">
        <div className="flex flex-col items-center max-w-md px-6">
          <img src={LogoKallma} alt="Logo" className="w-20 h-20 mb-4 md:w-24 md:h-24" />
          <h1 className="text-5xl md:text-7xl font-bold whitespace-nowrap mb-6 md:mb-8">
            <span className="text-gray-800/60">Kal</span>
            <span className="text-gray-800/60">lma</span>
          </h1>
          <button
            onClick={() => navigate('/reserva')}
            className="flex items-center bg-gray-300/70 hover:bg-gray-400/80 text-gray-800 font-medium px-5 py-2.5 md:px-6 md:py-3 rounded-full shadow-xl hover:shadow-2xl transition duration-300 mb-8"
            style={{ width: '200px', height: '50px' }}
          >
            Reservar ahora
            <span className="ml-3">
              <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </span>
          </button>
          
          {/* Fondo borroso para clima + slogan */}
          <div className="backdrop-blur-md bg-white/30 rounded-2xl p-4 flex flex-col items-center space-y-4 w-full">
            {/* Clima en mobile/tablet */}
            {weather && (
              <div className="flex items-center space-x-3 text-base md:text-lg font-semibold text-gray-800/60">
                <img src={weather.current.condition.icon} alt="icono clima" className="w-10 h-10" />
                <span>{weather.location.name}: {weather.current.temp_c}°C, {weather.current.condition.text}</span>
              </div>
            )}

            {/* Slogan en mobile/tablet */}
            <div className="flex items-center space-x-3 text-base md:text-lg font-semibold text-center text-gray-800/60">
              <div className="flex flex-col leading-snug">
                <span>Cabañas Kallma: descanso en </span>
                <span>la nieve, paz en cada detalle.</span>
              </div>
              <Wind className="w-8 h-8 md:w-9 md:h-9 text-gray-800/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal - Desktop */}
      <div className="hidden lg:grid absolute inset-0" style={{ gridTemplateColumns: '41.5% 58.5%' }}>
        {/* Columna 1: Área borrosa (logo + "Kal") */}
        <div className="flex items-center justify-end pr-0">
          <div className="flex items-center -translate-y-20">
            <img src={LogoKallma} alt="Logo" className="w-28 h-28 mr-6" />
            <h1 className="text-9xl font-bold text-white" style={{ letterSpacing: 'normal' }}>Kal</h1>
          </div>
        </div>
        
        {/* Columna 2: Área nítida ("lma" + botón) */}
        <div className="flex items-center">
          <div className="flex items-center -translate-y-20">
            <h1 className="text-9xl font-bold text-gray-800/60" style={{ letterSpacing: 'normal' }}>lma</h1>
            <button
              onClick={() => navigate('/reserva')}
              className="flex items-center ml-10 mt-[28px] bg-gray-600/70 hover:bg-gray-500/80 text-white font-medium px-6 py-3 rounded-full shadow-xl hover:shadow-2xl transition duration-300"
              style={{ width: '200px', height: '50px' }}
            >
              Reservar ahora
              <span className="ml-3">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 🌤️ Clima - Desktop only */}
      {weather && (
        <div className="hidden lg:flex absolute bottom-44 left-24 ml-6 items-center space-x-3 text-lg font-semibold text-gray-200">
          <img src={weather.current.condition.icon} alt="icono clima" className="w-10 h-10" />
          <span>{weather.location.name}: {weather.current.temp_c}°C, {weather.current.condition.text}</span>
        </div>
      )}

      {/* ❄️ Slogan - Desktop only */}
      <div className="hidden lg:flex absolute bottom-32 left-24 ml-6 items-end space-x-3 text-xl font-semibold">
        <div className="flex flex-col leading-snug">
          <span className="text-gray-200">Cabañas Kallma: descanso en </span>
          <span className="text-gray-200">la nieve, paz en cada detalle.</span>
        </div>
        <Wind className="w-10 h-10 text-gray-200" />
      </div>
    </section>
  );
}



