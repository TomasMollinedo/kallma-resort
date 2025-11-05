import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Wrench, LogOut, Home, Calendar, Building, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import ReservationsManagement from '../admin/ReservationsManagement';

export default function DashboardOperador() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard'); // dashboard, reservations

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Si estamos en la sección de reservas, mostrar el componente correspondiente
  if (activeSection === 'reservations') {
    return <ReservationsManagement onBack={() => setActiveSection('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header del Dashboard */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Panel de Operador</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-md transition"
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
            <div className="bg-blue-100 p-3 rounded-full">
              <Wrench size={32} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Bienvenido, {user?.nombre}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-blue-600 font-semibold text-sm mt-1">
                Rol: {user?.rol}
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas del Día */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Reservas Hoy</p>
                <p className="text-3xl font-bold text-blue-600">--</p>
              </div>
              <Calendar size={32} className="text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Check-ins</p>
                <p className="text-3xl font-bold text-green-600">--</p>
              </div>
              <CheckCircle size={32} className="text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Check-outs</p>
                <p className="text-3xl font-bold text-orange-600">--</p>
              </div>
              <XCircle size={32} className="text-orange-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Mantenimientos</p>
                <p className="text-3xl font-bold text-purple-600">--</p>
              </div>
              <Clock size={32} className="text-purple-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Acciones Operativas */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Gestión de Reservas */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Calendar size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Gestión de Reservas</h3>
            <p className="text-gray-600 mb-4">
              Consulta y gestiona las reservas del día y próximas
            </p>
            <button 
              onClick={() => setActiveSection('reservations')}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Ver Reservas
            </button>
          </div>

          {/* Reportes Financieros */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Gestión de Pagos</h3>
              <p className="text-gray-600 mb-4">
                Consulta pagos e ingresos
              </p>
              <button className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition">
                Ver historial de pagos
              </button>
            </div>

          {/* Estado de Cabañas */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Building size={24} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Estado de Cabañas</h3>
            <p className="text-gray-600 mb-4">
              Actualiza el estado y disponibilidad de cabañas
            </p>
            <button className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition">
              Ver Cabañas
            </button>
          </div>

          {/* Mantenimiento */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Wrench size={24} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mantenimiento</h3>
            <p className="text-gray-600 mb-4">
              Registra y gestiona tareas de mantenimiento
            </p>
            <button className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition">
              Ver Tareas
            </button>
          </div>

          {/* Consultas de Clientes */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Calendar size={24} className="text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Consultas</h3>
            <p className="text-gray-600 mb-4">
              Atiende y gestiona consultas de clientes
            </p>
            <button className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition">
              Ver Consultas
            </button>
          </div>
        </div>

        {/* Tareas Pendientes */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Tareas Pendientes del Día</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <input type="checkbox" className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Preparar cabaña 1 para check-in de las 14:00</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <input type="checkbox" className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Realizar check-out cabaña 3 - 10:00</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <input type="checkbox" className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Revisar mantenimiento cabaña 2</span>
            </div>
          </div>
        </div>

        {/* Nota Informativa */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Panel Operativo</h3>
          <p className="text-gray-700">
            Como operador, eres responsable de la gestión diaria del resort. 
            Asegúrate de mantener actualizados los estados de las cabañas, 
            procesar check-ins y check-outs a tiempo, y atender todas las consultas de los clientes.
          </p>
        </div>
      </main>
    </div>
  );
}
