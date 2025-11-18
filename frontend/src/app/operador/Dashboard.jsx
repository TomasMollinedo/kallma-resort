import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  LogOut, 
  Home, 
  Calendar, 
  Building, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import ReservationsManagement from '../admin/ReservationsManagement';
import PagosManagement from './PagosManagement';
import ConsultasManagement from './ConsultasManagement';
import CabanasMap from './CabanasMap';
import { getOperatorDashboardStats } from '../services/statsService';

export default function DashboardOperador() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard'); // dashboard, reservations, pagos, consultas, cabanas

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);
      const data = await getOperatorDashboardStats(token);
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas de operador:', error);
      setStatsError('No se pudieron cargar las estadísticas. Intenta nuevamente.');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'dashboard') {
      loadStats();
    }
  }, [activeSection]);

  const occupancyPercentage =
    stats?.occupancyRate != null
      ? Math.round(Number(stats.occupancyRate))
      : null;

  // Secciones hijas
  if (activeSection === 'reservations') {
    return <ReservationsManagement onBack={() => setActiveSection('dashboard')} />;
  }

  if (activeSection === 'pagos') {
    return <PagosManagement onBack={() => setActiveSection('dashboard')} />;
  }

  if (activeSection === 'consultas') {
    return <ConsultasManagement onBack={() => setActiveSection('dashboard')} />;
  }

  if (activeSection === 'cabanas') {
    return <CabanasMap onBack={() => setActiveSection('dashboard')} />;
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

        {/* Nota Informativa */}
        <div className="mt-8 mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Panel Operativo</h3>
          <p className="text-gray-700">
            Como operador, eres responsable de la gestión diaria del resort. 
            Asegúrate de mantener actualizados los estados de las cabañas, 
            procesar check-ins y check-outs a tiempo, y atender todas las consultas de los clientes.
          </p>
        </div>

        {/* Estadísticas del Día */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Estadísticas del día</h2>
            </div>
            <button
              onClick={loadStats}
              disabled={loadingStats}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <RefreshCw size={16} className={loadingStats ? 'animate-spin' : ''} />
              <span>{loadingStats ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>

          {statsError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {statsError}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ocupación actual</p>
                <p className="text-4xl font-bold text-blue-600">
                  {loadingStats ? '--' : occupancyPercentage != null ? `${occupancyPercentage}%` : '--'}
                </p>
                <p className="text-xs text-gray-500 mt-3">Porcentaje de cabañas ocupadas hoy</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <Home size={34} className="text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">Reservas pendientes de pago</p>
                <p className="text-4xl font-bold text-rose-600">
                  {loadingStats ? '--' : stats?.reservationsPendingPayment ?? '--'}
                </p>
                <p className="text-xs text-gray-500 mt-3">Regulariza estos cobros para evitar retrasos</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
                <DollarSign size={34} className="text-rose-500" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Hospedados Hoy</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {loadingStats ? '--' : stats?.hostedToday ?? '--'}
                  </p>
                </div>
                <Building size={32} className="text-blue-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Check-ins Hoy</p>
                  <p className="text-3xl font-bold text-green-600">
                    {loadingStats ? '--' : stats?.checkinsToday ?? '--'}
                  </p>
                </div>
                <CheckCircle size={32} className="text-green-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Check-outs Hoy</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {loadingStats ? '--' : stats?.checkoutsToday ?? '--'}
                  </p>
                </div>
                <XCircle size={32} className="text-orange-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Cabañas en Mantenimiento</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {loadingStats ? '--' : stats?.cabinsInMaintenanceToday ?? '--'}
                  </p>
                </div>
                <Clock size={32} className="text-purple-600 opacity-50" />
              </div>
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

          {/* Gestión de Pagos */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Gestión de Pagos</h3>
            <p className="text-gray-600 mb-4">
              Consulta pagos e ingresos
            </p>
            <button 
              onClick={() => setActiveSection('pagos')}
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            >
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
            <button
              onClick={() => setActiveSection('cabanas')}
              className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition"
            >
              Ver Cabañas
            </button>
          </div>

          {/* Consultas de Clientes */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Consultas de Clientes</h3>
            <p className="text-gray-600 mb-4">
              Atiende y responde consultas de clientes
            </p>
            <button 
              onClick={() => setActiveSection('consultas')}
              className="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition"
            >
              Ver Consultas
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
