import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Home, Users, Building, Calendar, DollarSign, Settings } from 'lucide-react';

export default function DashboardAdministrador() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header del Dashboard */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">Panel de Administrador</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-purple-50 rounded-md transition"
            >
              <Home size={20} />
              <span>Inicio</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tarjeta de Bienvenida */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Shield size={32} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Bienvenido, {user?.nombre}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-purple-600 font-semibold text-sm mt-1">
                Rol: {user?.rol}
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Usuarios</p>
                <p className="text-3xl font-bold text-purple-600">--</p>
              </div>
              <Users size={32} className="text-purple-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Cabañas</p>
                <p className="text-3xl font-bold text-blue-600">--</p>
              </div>
              <Building size={32} className="text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Reservas Activas</p>
                <p className="text-3xl font-bold text-green-600">--</p>
              </div>
              <Calendar size={32} className="text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ingresos Mes</p>
                <p className="text-3xl font-bold text-orange-600">--</p>
              </div>
              <DollarSign size={32} className="text-orange-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Acciones de Administración */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Gestión de Usuarios */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Users size={24} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Gestión de Usuarios</h3>
            <p className="text-gray-600 mb-4">
              Administra usuarios, roles y permisos del sistema
            </p>
            <button className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition">
              Gestionar Usuarios
            </button>
          </div>

          {/* Gestión de Cabañas */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Building size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Gestión de Cabañas</h3>
            <p className="text-gray-600 mb-4">
              Administra el inventario y estado de las cabañas
            </p>
            <button className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
              Gestionar Cabañas
            </button>
          </div>

          {/* Gestión de Reservas */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Calendar size={24} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Gestión de Reservas</h3>
            <p className="text-gray-600 mb-4">
              Supervisa y administra todas las reservas
            </p>
            <button className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition">
              Ver Reservas
            </button>
          </div>

          {/* Reportes Financieros */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <DollarSign size={24} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Reportes Financieros</h3>
            <p className="text-gray-600 mb-4">
              Consulta reportes de pagos e ingresos
            </p>
            <button className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition">
              Ver Reportes
            </button>
          </div>

          {/* Configuración del Sistema */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Settings size={24} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Configuración</h3>
            <p className="text-gray-600 mb-4">
              Ajusta parámetros y configuraciones generales
            </p>
            <button className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition">
              Configuración
            </button>
          </div>
        </div>

        {/* Nota Importante */}
        <div className="mt-8 bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-xl">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Panel de Administración</h3>
          <p className="text-gray-700">
            Como administrador, tienes acceso completo a todas las funcionalidades del sistema. 
            Puedes gestionar usuarios, cabañas, reservas, pagos y configuraciones generales. 
            Usa este panel con responsabilidad.
          </p>
        </div>
      </main>
    </div>
  );
}
