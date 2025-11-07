import { useState, useEffect } from 'react';
import { 
  Calendar, Search, Filter, Eye, RefreshCw, ChevronLeft, ChevronRight, 
  AlertCircle, Loader2, ArrowLeft, DollarSign, Home, Users, CheckCircle,
  XCircle, Clock, Ban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getAllReservations,
  getOperationalStates,
  getStatusBadgeColor,
  getTodayDate
} from '../services/reservationService';
import { formatIsoDateForDisplay } from '../utils/dateUtils';
import { validateSearchLength } from '../utils/searchUtils';
import { validateDateRange } from '../utils/dateUtils';

import ReservationDetailModal from './components/ReservationDetailModal';
import ReleaseReservationModal from './components/ReleaseReservationModal';
import PaymentFormModal from './components/PaymentFormModal';

export default function ReservationsManagement({ onBack }) {
  const { token } = useAuth();
  
  // Estados principales
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchError, setSearchError] = useState(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(''); // Sin filtro de estado por defecto
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(''); // Todas
  
  // Modo de filtro: 'date' o 'today'
  const [filterMode, setFilterMode] = useState('date'); // 'date' o 'today'
  
  // Filtros de fecha (solo activos si filterMode === 'date')
  const [selectedDateFilter, setSelectedDateFilter] = useState('range'); // arrivals, departures, inhouse, range
  const [specificDate, setSpecificDate] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Filtros de Hoy (solo activos si filterMode === 'today')
  const [todayFilter, setTodayFilter] = useState('arrivals'); // 'arrivals', 'departures' o 'inhouse'
  
  // Estados de modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  // Cargar reservas al montar y cuando cambien los filtros
  useEffect(() => {
    if (token) {
      loadReservations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, selectedPaymentStatus, filterMode, selectedDateFilter, specificDate, dateFrom, dateTo, todayFilter, token]);

  /**
   * Cargar reservas desde el backend
   */
  const loadReservations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filterParams = {};
      
      // Aplicar filtro de búsqueda por código
      if (searchTerm.trim()) {
        filterParams.cod_reserva = searchTerm.trim();
      }
      
      // Aplicar filtro de estado operativo
      if (selectedStatus) {
        filterParams.id_est_op = parseInt(selectedStatus);
      }
      
      // Aplicar filtro de estado de pago
      if (selectedPaymentStatus !== '') {
        filterParams.esta_pagada = selectedPaymentStatus === 'true';
      }
      
      // Aplicar filtros según el modo seleccionado
      if (filterMode === 'date') {
        // Modo: Filtros de Fecha
        if (selectedDateFilter === 'arrivals' && specificDate) {
          filterParams.arrivals_on = specificDate;
        } else if (selectedDateFilter === 'departures' && specificDate) {
          filterParams.departures_on = specificDate;
        } else if (selectedDateFilter === 'inhouse' && specificDate) {
          filterParams.inhouse_on = specificDate;
        } else if (selectedDateFilter === 'range') {
          // Validar que fecha_desde no sea mayor que fecha_hasta
          const dateValidation = validateDateRange(dateFrom, dateTo);
          if (!dateValidation.isValid) {
            setError(dateValidation.error);
            setLoading(false);
            return;
          }
          // Permitir filtrar solo por fecha_desde, solo por fecha_hasta, o ambos
          if (dateFrom) {
            filterParams.fecha_desde = dateFrom;
          }
          if (dateTo) {
            filterParams.fecha_hasta = dateTo;
          }
        }
      } else if (filterMode === 'today') {
        // Modo: Filtros de Hoy
        const today = getTodayDate();
        if (todayFilter === 'arrivals') {
          filterParams.arrivals_on = today;
        } else if (todayFilter === 'departures') {
          filterParams.departures_on = today;
        } else if (todayFilter === 'inhouse') {
          filterParams.inhouse_on = today;
        }
      }
      
      const response = await getAllReservations(filterParams, token);
      setReservations(response.data || []);
    } catch (err) {
      console.error('Error al cargar reservas:', err);
      setError(err.message || 'Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar búsqueda
   */
  const handleSearch = () => {
    // Validar solo la longitud del término de búsqueda
    const validation = validateSearchLength(searchTerm, 50);
    if (!validation.isValid) {
      setSearchError(validation.error);
      return;
    }
    setSearchError(null);
    loadReservations();
  };

  /**
   * Manejar cambio en el input de búsqueda
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Limpiar error cuando el usuario empieza a escribir
    if (searchError) {
      setSearchError(null);
    }
  };

  /**
   * Limpiar filtros
   */
  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchError(null);
    setSelectedStatus(''); // Sin filtro
    setSelectedPaymentStatus('');
    setFilterMode('date');
    setSelectedDateFilter('range');
    setSpecificDate('');
    setDateFrom('');
    setDateTo('');
    setTodayFilter('arrivals');
  };

  /**
   * Refrescar lista
   */
  const handleRefresh = () => {
    loadReservations();
  };

  /**
   * Abrir modal para ver detalle
   */
  const handleViewDetail = (reservation) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  /**
   * Abrir modal para liberar (cambiar estado)
   */
  const handleRelease = (reservation) => {
    setSelectedReservation(reservation);
    setShowReleaseModal(true);
  };

  /**
   * Callback después de liberar reserva
   */
  const handleReleaseSuccess = () => {
    setShowReleaseModal(false);
    setSuccess('Estado de reserva actualizado exitosamente');
    setTimeout(() => setSuccess(null), 3000);
    loadReservations();
  };

  /**
   * Abrir modal para registrar pago
   */
  const handleRegisterPayment = (reservation) => {
    setSelectedReservation(reservation);
    setShowPaymentModal(true);
  };

  /**
   * Callback después de registrar pago
   */
  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSuccess('Pago registrado exitosamente');
    setTimeout(() => setSuccess(null), 3000);
    loadReservations();
  };

  /**
   * Obtener badge de estado
   */
  const getStatusBadge = (estado) => {
    const icons = {
      'Confirmada': <CheckCircle size={14} />,
      'Cancelada': <XCircle size={14} />,
      'No aparecio': <Ban size={14} />,
      'Finalizada': <Clock size={14} />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(estado)}`}>
        {icons[estado]}
        {estado}
      </span>
    );
  };

  /**
   * Obtener badge de pago
   */
  const getPaymentBadge = (estaPagada) => {
    if (estaPagada) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
          <DollarSign size={14} />
          Pagada
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
          <Clock size={14} />
          Pendiente
        </span>
      );
    }
  };

  const operationalStates = getOperationalStates();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Botón Volver al Dashboard */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-700 hover:text-orange-500 font-medium transition"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </button>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-lg">
                <Calendar size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
                <p className="text-gray-600">Administra todas las reservas del sistema</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start gap-3">
            <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg flex items-start gap-3">
            <CheckCircle size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Éxito</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Buscador por código */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search size={16} className="inline mr-1" />
                Buscar por Código
              </label>
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ingrese código de reserva..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    maxLength={100}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                      searchError 
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : 'border-gray-300 focus:ring-orange-500'
                    }`}
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
                  >
                    <Search size={20} />
                  </button>
                </div>
                {searchError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {searchError}
                  </p>
                )}
              </div>
            </div>

            {/* Filtro de Estado */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Estado
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todos los estados</option>
                {operationalStates.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Estado de Pago */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-1" />
                Estado de Pago
              </label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todas</option>
                <option value="true">Pagadas</option>
                <option value="false">Pendientes</option>
              </select>
            </div>
          </div>

          {/* Filtros de Fecha */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="radio"
                id="filterByDate"
                checked={filterMode === 'date'}
                onChange={() => setFilterMode('date')}
                className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <label htmlFor="filterByDate" className="text-sm font-semibold text-gray-700 cursor-pointer">
                <Calendar size={16} className="inline mr-1" />
                Filtros de Fecha
              </label>
            </div>
            
            {filterMode === 'date' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ml-6">
                {/* Tipo de filtro de fecha */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tipo de Filtro</label>
                  <select
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="arrivals">Llegadas (Arrivals)</option>
                    <option value="departures">Salidas (Departures)</option>
                    <option value="inhouse">Hospedados (In-House)</option>
                    <option value="range">Rango de Fechas</option>
                  </select>
                </div>

                {/* Fecha específica (para arrivals, departures, inhouse) */}
                {selectedDateFilter !== 'range' && (
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Fecha Específica</label>
                    <input
                      type="date"
                      value={specificDate}
                      onChange={(e) => setSpecificDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                  </div>
                )}

                {/* Rango de fechas */}
                {selectedDateFilter === 'range' && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fecha Desde (opcional)</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Fecha Hasta (opcional)</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Filtros de Hoy */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="radio"
                id="filterByToday"
                checked={filterMode === 'today'}
                onChange={() => setFilterMode('today')}
                className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <label htmlFor="filterByToday" className="text-sm font-semibold text-gray-700 cursor-pointer">
                <Clock size={16} className="inline mr-1" />
                Hoy
              </label>
            </div>
            
            {filterMode === 'today' && (
              <div className="flex flex-wrap gap-4 ml-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={todayFilter === 'arrivals'}
                    onChange={() => setTodayFilter('arrivals')}
                    className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Llegadas Hoy</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={todayFilter === 'departures'}
                    onChange={() => setTodayFilter('departures')}
                    className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Salidas Hoy</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={todayFilter === 'inhouse'}
                    onChange={() => setTodayFilter('inhouse')}
                    className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Hospedados Hoy</span>
                </label>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition text-sm"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition text-sm"
            >
              <RefreshCw size={16} />
              Refrescar
            </button>
          </div>
        </div>

        {/* Tabla de Reservas */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Info de resultados */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-semibold">{reservations.length}</span> reserva(s)
            </p>
          </div>

          {/* Tabla */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={48} className="animate-spin text-orange-500" />
              <p className="ml-4 text-gray-600">Cargando reservas...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Calendar size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg font-semibold">No se encontraron reservas</p>
              <p className="text-gray-500 text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Check-in / Check-out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Noches
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Personas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Cabañas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Servicios
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Monto Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Pago
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id_reserva} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {reservation.cod_reserva}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{reservation.cliente_nombre}</div>
                        <div className="text-xs text-gray-500">{reservation.cliente_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatIsoDateForDisplay(reservation.check_in)}</div>
                        <div className="text-xs text-gray-500">{formatIsoDateForDisplay(reservation.check_out)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {reservation.noches} noche(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Users size={14} />
                          {reservation.cant_personas}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Home size={14} />
                          {reservation.cantidad_cabanas || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <DollarSign size={14} />
                          {reservation.cantidad_servicios || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${parseFloat(reservation.monto_total_res).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(reservation.estado_operativo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentBadge(reservation.esta_pagada)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetail(reservation)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Ver detalle"
                          >
                            <Eye size={18} />
                          </button>
                          {reservation.estado_operativo === 'Confirmada' && (
                            <>
                              <button
                                onClick={() => handleRegisterPayment(reservation)}
                                className="px-3 py-1 text-xs font-semibold text-green-600 hover:bg-green-50 border border-green-300 rounded-lg transition"
                                title="Registrar pago"
                              >
                                Pagar
                              </button>
                              <button
                                onClick={() => handleRelease(reservation)}
                                className="px-3 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-50 border border-orange-300 rounded-lg transition"
                                title="Liberar reserva"
                              >
                                Liberar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showDetailModal && selectedReservation && (
        <ReservationDetailModal
          reservation={selectedReservation}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showReleaseModal && selectedReservation && (
        <ReleaseReservationModal
          reservation={selectedReservation}
          onClose={() => setShowReleaseModal(false)}
          onSuccess={handleReleaseSuccess}
        />
      )}

      {showPaymentModal && selectedReservation && (
        <PaymentFormModal
          reserva={selectedReservation}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
