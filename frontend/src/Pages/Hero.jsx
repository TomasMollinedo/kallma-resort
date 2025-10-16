import React, { useEffect, useState } from "react";
import axios from "axios";
import LogoKallma from '/src/assets/icono-kallma-blanco.svg';
import '../index.css';
import { Wind } from "lucide-react";

export default function Hero() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiKey = "a5bb75fd213c4e058dd202412250710"; // tu key
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
      {/* Panel desenfocado */}
      <div className="absolute top-0 left-0 w-[41.5%] h-full backdrop-blur-lg bg-black/30"></div>

      {/* Contenido principal */}
      <div className="absolute inset-0 flex items-center justify-center text-white -translate-y-20">
        <div className="flex items-center" style={{ transform: 'translateX(-8%)' }}>
          <img src={LogoKallma} alt="Logo" className="w-28 h-28 mr-6 mb-2" />
          <h1 className="text-9xl font-bold flex whitespace-nowrap">
            <span className="text-white">Kal</span>
            <span className="text-gray-800/60">lma</span>
          </h1>
          <button
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

      {/* 🌤️ Clima de Ushuaia (arriba del slogan) */}
      {weather && (
        <div className="absolute bottom-44 left-24 ml-6 flex items-center space-x-3 text-lg font-semibold text-gray-200">
          <img src={weather.current.condition.icon} alt="icono clima" className="w-10 h-10" />
          <span>{weather.location.name}: {weather.current.temp_c}°C, {weather.current.condition.text}</span>
        </div>
      )}

      {/* ❄️ Slogan */}
      <div className="absolute bottom-32 left-24 ml-6 flex items-end space-x-3 text-xl font-semibold">
        <div className="flex flex-col leading-snug">
          <span className="text-gray-200">Cabañas Kallma: descanso en </span>
          <span className="text-gray-200">la nieve, paz en cada detalle.</span>
        </div>
        <Wind className="w-10 h-10 text-gray-200" />
      </div>
    </section>
  );
}

