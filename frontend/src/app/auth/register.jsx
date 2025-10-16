import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import Fondo from '../../assets/fondo.jpg';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    telefono: '',
    dni: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Preparar datos para enviar (solo enviar telefono y dni si tienen valor)
      const dataToSend = {
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
      };

      if (formData.telefono) dataToSend.telefono = formData.telefono;
      if (formData.dni) dataToSend.dni = formData.dni;

      // Llamar a la API de registro
      await registerUser(dataToSend);
      
      // Mostrar mensaje de éxito y redirigir al login
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-2xl font-bold mb-6">Registrate</h2>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="w-full mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
            ¡Registro exitoso! Redirigiendo al login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading || success}
            className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading || success}
            className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          />
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            disabled={loading || success}
            className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          />
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono (opcional)"
            value={formData.telefono}
            onChange={handleChange}
            disabled={loading || success}
            className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          />
          <input
            type="text"
            name="dni"
            placeholder="DNI (opcional)"
            value={formData.dni}
            onChange={handleChange}
            disabled={loading || success}
            className="w-full mb-6 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          />

          <button 
            type="submit"
            disabled={loading || success}
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-4 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-orange-500 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}


