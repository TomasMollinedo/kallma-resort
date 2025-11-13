import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, CreditCard, MessageSquare, ArrowLeft } from 'lucide-react';
import ClientNavbar from './ClientNavbar';
import MisReservas from './components/MisReservas';
import PagosManagement from './PagosManagement';

export default function DashboardCliente() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showReservas, setShowReservas] = React.useState(false);
  const [showPagos, setShowPagos] = React.useState(false);

  return (
    <div
      className={`min-h-screen ${
        showReservas
          ? 'bg-gray-50'
          : showPagos
          ? 'bg-gray-50'
          : 'bg-gradient-to-br from-orange-50 to-orange-100'
      }`}
    >
      {/* Navbar simplificado negro */}
      <ClientNavbar />

      {/* Espaciado para el navbar fijo */}
      <div className="h-16"></div>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {showPagos ? (
          <PagosManagement onBack={() => setShowPagos(false)} />
        ) : !showReservas && (
          <>
            {/* Mensaje de Bienvenida */}
            <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 sm:p-6 rounded-r-xl shadow-md">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                Bienvenido a tu Panel
              </h3>
              <p className="text-sm sm:text-base text-gray-700">
                Desde aquí puedes gestionar tus reservas, revisar pagos y ver tu información personal.
              </p>
            </div>

            {/* Tarjeta de Datos del Usuario */}
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-orange-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <User size={28} className="text-orange-600 sm:w-8 sm:h-8" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                      {user?.nombre}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">DNI:</p>
                  <p className="font-semibold">{user?.dni || 'No registrado'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Teléfono:</p>
                  <p className="font-semibold">{user?.telefono || 'No registrado'}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Sección de Reservas */}
        {!showPagos && showReservas ? (
          <div className="space-y-4">
            <MisReservas onClose={() => setShowReservas(false)} />
          </div>
        ) : !showPagos && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mis Reservas */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Calendar size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Mis Reservas</h3>
                <p className="text-gray-600 mb-4">
                  Consulta y gestiona tus reservas
                </p>
                <button
                  onClick={() => setShowReservas(true)}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Ver Reservas
                </button>
              </div>

              {/* Mis Pagos */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <CreditCard size={24} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Mis Pagos</h3>
                <p className="text-gray-600 mb-4">
                  Revisa tu historial de pagos
                </p>
                <button
                  onClick={() => setShowPagos(true)}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-medium"
                >
                  Ver Pagos
                </button>
              </div>

              {/* Contacto */}
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={24} className="text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Contacto</h3>
                <p className="text-gray-600 mb-4">
                  Envía consultas o solicitudes
                </p>
                <button
                  onClick={() => navigate('/contacto')}
                  className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  Contactar
                </button>
              </div>
            </div>

            {/* Acceso Rápido al Catálogo */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Explora Nuestro Resort</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </>
        )}
      </main>
    </div>
  );
}

