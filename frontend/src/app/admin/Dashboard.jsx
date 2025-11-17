import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LogOut, 
  Home, 
  Users, 
  Building, 
  Calendar, 
  DollarSign, 
  Settings, 
  CreditCard,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

import UsersManagement from './UsersManagement';
import CabanasZonasManagement from './CabanasZonasManagement';
import ReservationsManagement from './ReservationsManagement';
import PagosManagement from './PagosManagement';
import { getAdminDashboardStats } from '../services/statsService';

const PAYMENT_COLORS = ['#7c3aed', '#0ea5e9', '#22c55e', '#f97316', '#e11d48', '#6366f1'];

export default function DashboardAdministrador() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard'); // dashboard, users, cabanas, reservations, pagos

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

  /**
   * Obtiene las métricas del dashboard de administración desde el backend.
   * Alineamos la forma de consumo con el resto de los servicios (response.data).
   */
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);
      const metrics = await getAdminDashboardStats(token);
      setStats(metrics || null);
    } catch (error) {
      console.error('Error al cargar estadísticas de admin:', error);
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

  // Preparar datos para el gráfico de barras (ingresos últimos 12 meses)
  const revenueData =
    stats?.revenueLast12Months?.map((item) => ({
      name: `${item.month}/${item.year}`,
      total: Number(item.total) || 0
    })) || [];

  // Preparar datos para el gráfico de torta (métodos de pago)
  const paymentData =
    stats?.currentMonthPaymentMethodsDistribution?.map((item) => ({
      name: item.method,
      value: Number(item.count) || 0
    })) || [];

  const totalPaymentValue = paymentData.reduce((sum, method) => sum + method.value, 0);
  const paymentChartData = paymentData.map((item) => ({
    ...item,
    percentage:
      totalPaymentValue > 0 ? Number(((item.value / totalPaymentValue) * 100).toFixed(1)) : 0
  }));

  /**
   * Formatea el texto del legend del gráfico de métodos de pago agregando el porcentaje del total.
   * @param {string} label - Nombre del método de pago que se mostrará en el legend.
   * @param {object} entry - Entrada del legend que contiene los datos del sector seleccionado.
   * @returns {string} Etiqueta formateada con el porcentaje agregado.
   */
  const formatPaymentLegend = (label, entry) => {
    const methodPercentage = entry?.payload?.percentage ?? 0;
    const percentageText = Number.isInteger(methodPercentage)
      ? methodPercentage.toString()
      : methodPercentage.toFixed(1);
    return `${label} (${percentageText}%)`;
  };

  // Si estamos en una sección específica, mostrar el componente correspondiente
  if (activeSection === 'users') {
    return <UsersManagement onBack={() => setActiveSection('dashboard')} />;
  }

  if (activeSection === 'cabanas') {
    return <CabanasZonasManagement onBack={() => setActiveSection('dashboard')} />;
  }

  if (activeSection === 'reservations') {
    return <ReservationsManagement onBack={() => setActiveSection('dashboard')} />;
  }

  if (activeSection === 'pagos') {
    return <PagosManagement onBack={() => setActiveSection('dashboard')} />;
  }

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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Estadísticas rápidas</h2>
            <button
              onClick={loadStats}
              disabled={loadingStats}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
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

          {/* KPI Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Usuarios</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {loadingStats ? '--' : stats?.totalUsers ?? '--'}
                  </p>
                </div>
                <Users size={32} className="text-purple-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Cabañas</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {loadingStats ? '--' : stats?.totalCabins ?? '--'}
                  </p>
                </div>
                <Building size={32} className="text-blue-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Zonas</p>
                  <p className="text-3xl font-bold text-green-600">
                    {loadingStats ? '--' : stats?.totalZones ?? '--'}
                  </p>
                </div>
                <Calendar size={32} className="text-green-600 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Ingresos Mes Actual</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {loadingStats
                      ? '--'
                      : stats?.currentMonthRevenue != null
                        ? `$ ${Number(stats.currentMonthRevenue).toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}`
                        : '--'}
                  </p>
                </div>
                <DollarSign size={32} className="text-orange-600 opacity-50" />
              </div>
            </div>
          </div>

          {/* Gráficos dentro de estadísticas rápidas */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Ingresos últimos 12 meses */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Ingresos</p>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Ingresos últimos 12 meses
                  </h3>
                </div>
              </div>
              {revenueData.length === 0 && !loadingStats ? (
                <p className="text-sm text-gray-500">Sin datos de ingresos.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) =>
                          `$ ${Number(value).toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}`
                        }
                      />
                      <Bar dataKey="total" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Distribución métodos de pago */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Pagos</p>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Métodos de pago más utilizados
                  </h3>
                </div>
              </div>
              {paymentChartData.length === 0 && !loadingStats ? (
                <p className="text-sm text-gray-500">Sin datos de métodos de pago.</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentChartData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {paymentChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend formatter={formatPaymentLegend} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
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
            <button 
              onClick={() => setActiveSection('users')}
              className="w-full bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition"
            >
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
            <button 
              onClick={() => setActiveSection('cabanas')}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Gestionar Cabañas
            </button>
          </div>

          {/* Gestión de Reservas */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Calendar size={24} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Gestión de Reservas</h3>
            <p className="text-gray-600 mb-4">
              Supervisa, administra todas las reservas y registra nuevos pagos
            </p>
            <button 
              onClick={() => setActiveSection('reservations')}
              className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition">
              Ver Reservas
            </button>
          </div>

          {/* Gestión de Pagos */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <CreditCard size={24} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Gestión de Pagos</h3>
            <p className="text-gray-600 mb-4">
              Consulta historial de pagos y anula transacciones
            </p>
            <button 
              onClick={() => setActiveSection('pagos')}
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            >
              Gestionar Pagos
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
