import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import Fondo from '../../assets/fondo.jpg'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Llamar a la API de login
      const response = await loginUser({ email, password });
      
      // Guardar usuario y token en el contexto
      login(response.data.user, response.data.token);
      
      // Verificar si hay una reserva pendiente
      const pendingReservation = localStorage.getItem('pendingReservation');
      
      if (pendingReservation && response.data.user.rol === 'Cliente') {
        // Parsear los datos de la reserva pendiente
        const reservaData = JSON.parse(pendingReservation);
        
        // Redirigir de vuelta a la página de pago con los datos (nuevo flujo)
        navigate('/reserva/pago', { 
          state: reservaData,
          replace: true 
        });
      } else {
        // Redirigir según el rol del usuario
        switch (response.data.user.rol) {
          case 'Administrador':
            navigate('/dashboard/admin');
            break;
          case 'Operador':
            navigate('/dashboard/operador');
            break;
          case 'Cliente':
          default:
            navigate('/dashboard/cliente');
            break;
        }
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
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
        <h2 className="text-2xl font-bold mb-6">Inicia sesión con correo y contraseña</h2>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full mb-4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full mb-6 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
          />

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

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
