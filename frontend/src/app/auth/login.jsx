import React from 'react';
import { Link } from 'react-router-dom';
import Fondo from '../../assets/fondo.jpg'; 

export default function Login() {
  return (
    <div className="h-screen w-screen relative flex items-center justify-center">
      
      {/* Fondo borroso */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${Fondo})`,
          filter: 'blur(8px)',
        }}
      ></div>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Contenedor centrado */}
      <div className="relative bg-white rounded-xl shadow-xl p-8 w-80 z-10 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6">Inicia sesión con correo y contraseña</h2>

        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full mb-6 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <button className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition">
          Iniciar sesión
        </button>

        <p className="mt-4 text-sm">
          ¿No tenes cuenta?{' '}
          <Link to="/register" className="text-orange-500 font-semibold hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
