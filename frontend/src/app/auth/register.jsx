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
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Ingresa un correo válido';
    }

    if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)) {
      newErrors.password = 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número';
    }

    if (!formData.nombre.match(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/)) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres y solo puede contener letras y espacios';
    }

    if (formData.telefono && !formData.telefono.match(/^\+?(54)?\d{8,}$/)) {
      newErrors.telefono = 'El teléfono debe ser válido y puede incluir el prefijo +54';
    }

    if (formData.dni && !formData.dni.match(/^\d{7,8}$/)) {
      newErrors.dni = 'El DNI debe tener entre 7 y 8 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

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
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}

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
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}

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
          {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}

          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono (opcional)"
            value={formData.telefono}
            onChange={handleChange}
            disabled={loading || success}
            className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          />
          {errors.telefono && <p className="text-sm text-red-500">{errors.telefono}</p>}

          <input
            type="text"
            name="dni"
            placeholder="DNI (opcional)"
            value={formData.dni}
            onChange={handleChange}
            disabled={loading || success}
            className="w-full mb-6 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          />
          {errors.dni && <p className="text-sm text-red-500">{errors.dni}</p>}

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


