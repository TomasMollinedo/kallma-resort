import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, CreditCard, ClipboardList, MessageSquare } from 'lucide-react';

export default function DashboardCliente() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Espaciado para el Header fijo */}
      <div className="h-24"></div>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tarjeta de Bienvenida */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <User size={32} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                ¡Bienvenido, {user?.nombre}!
              </h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-gray-600">Teléfono:</p>
              <p className="font-semibold">{user?.telefono || 'No registrado'}</p>
            </div>
            <div>
              <p className="text-gray-600">DNI:</p>
              <p className="font-semibold">{user?.dni || 'No registrado'}</p>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Mis Reservas */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Calendar size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mis Reservas</h3>
            <p className="text-gray-600 mb-4">
              Consulta y gestiona tus reservas
            </p>
            <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
              Ver Reservas
            </button>
          </div>

          {/* Historial de Pagos */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <CreditCard size={24} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mis Pagos</h3>
            <p className="text-gray-600 mb-4">
              Revisa tu historial de pagos
            </p>
            <button className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition">
              Ver Pagos
            </button>
          </div>

          {/* Mis Datos */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <ClipboardList size={24} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mis Datos</h3>
            <p className="text-gray-600 mb-4">
              Actualiza tu información personal
            </p>
            <button className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition">
              Editar Datos
            </button>
          </div>

          {/* Contacto */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Contacto</h3>
            <p className="text-gray-600 mb-4">
              Envía consultas o solicitudes
            </p>
            <button className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition">
              Contactar
            </button>
          </div>
        </div>

        {/* Acceso Rápido al Catálogo */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Explora Nuestro Resort</h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/cabanas')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
            >
              Ver Cabañas
            </button>
            <button
              onClick={() => navigate('/servicios')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
            >
              Ver Servicios
            </button>
            <button
              onClick={() => navigate('/actividades')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
            >
              Ver Actividades
            </button>
          </div>
        </div>

        {/* Información Adicional */}
        <div className="mt-6 bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Bienvenido a tu Panel</h3>
          <p className="text-gray-700">
            Desde aquí puedes gestionar tus reservas, revisar pagos y mantener actualizada tu información. 
            Usa el menú superior para navegar por nuestro catálogo de cabañas, servicios y actividades.
          </p>
        </div>
      </main>
    </div>
  );
}
