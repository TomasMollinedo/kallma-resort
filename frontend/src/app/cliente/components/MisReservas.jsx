import React, { useState, useEffect, useCallback } from 'react';

import { useAuth } from '../../context/AuthContext';

import { obtenerMisReservas, cancelarReserva } from '../../../Reserva/reservaService';

import { Calendar, Search, Filter, X, Clock, Check, XCircle, Loader2, RefreshCw, Eye, ArrowLeft } from 'lucide-react';

import ReservationDetailModal from '../../admin/components/ReservationDetailModal';
import CancelReservationModal from '../../components/modals/CancelReservationModal';



export default function MisReservas({ onClose }) {

  const { token } = useAuth();

  const [reservas, setReservas] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({

    cod_reserva: '',

    estado_operativo: '',

    esta_pagada: '',

    fecha: ''

  });

  const [selectedReservation, setSelectedReservation] = useState(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [notification, setNotification] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  /**
   * Recupera las reservas del backend y normaliza la respuesta recibida.
   */
  const loadReservations = useCallback(async () => {
    if (!token) {
      setError('No hay token de autenticacion disponible.');
      setLoading(false);
      setReservas([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await obtenerMisReservas(token);

      if (Array.isArray(data)) {
        setReservas(data);
      } else if (data && Array.isArray(data.data)) {
        setReservas(data.data);
      } else if (data && Array.isArray(data.reservas)) {
        setReservas(data.reservas);
      } else if (data && typeof data === 'object') {
        setReservas([]);
      } else {
        setReservas([]);
      }
    } catch (err) {
      console.error('Error al obtener reservas:', err);
      setError('No se pudieron cargar las reservas. Intente nuevamente.');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, [token]);



  // Estados operativos para los filtros

  const estadosOperativos = [

    { id: '', nombre: 'Todos los estados' },

    { id: '2', nombre: 'Confirmada' },

    { id: '1', nombre: 'Cancelada' },

    { id: '3', nombre: 'No aparecio' },

    { id: '4', nombre: 'Finalizada' }

  ];



  const estadosPago = [

    { id: '', nombre: 'Todos' },

    { id: 'true', nombre: 'Pagada' },

    { id: 'false', nombre: 'Pendiente' }

  ];



  // Obtener reservas al cargar el componente

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  useEffect(() => {
    if (notification?.type === 'success') {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [notification]);



  // Filtrar reservas segun los filtros aplicados

  const filteredReservas = Array.isArray(reservas) ? reservas.filter(reserva => {

    return (

      (filters.cod_reserva === '' || 

       reserva.cod_reserva?.toLowerCase().includes(filters.cod_reserva.toLowerCase())) &&

      (filters.estado_operativo === '' || 

       reserva.id_est_op?.toString() === filters.estado_operativo) &&

      (filters.esta_pagada === '' || 

       reserva.esta_pagada?.toString() === filters.esta_pagada) &&

      (filters.fecha === '' || 

       reserva.check_in?.includes(filters.fecha) ||

       reserva.check_out?.includes(filters.fecha))

    );

  }) : [];



  const handleFilterChange = (e) => {

    const { name, value } = e.target;

    setFilters(prev => ({

      ...prev,

      [name]: value

    }));

  };



  const resetFilters = () => {

    setFilters({

      cod_reserva: '',

      estado_operativo: '',

      esta_pagada: '',

      fecha: ''

    });

  };



  /**

   * Refrescar lista

   */

  const handleRefresh = () => {

    loadReservations();

  };



  /**

   * Abre el modal de detalle de reserva con la reserva seleccionada

   * @param {object} reserva - El objeto de la reserva a mostrar en el modal

   */

  const handleViewDetails = (reserva) => {

    setSelectedReservation(reserva);

    setShowDetailModal(true);

  };



  /**

   * Cierra el modal de detalle de reserva

   */

  const handleCloseDetailModal = () => {

    setShowDetailModal(false);

    setSelectedReservation(null);

  };

  /**
   * Abre el modal de cancelación con la reserva seleccionada.
   * @param {object} reserva - Reserva que desea cancelarse.
   */
  const handleOpenCancelModal = (reserva) => {
    setNotification(null);
    setCancelError(null);
    setReservationToCancel(reserva);
    setShowCancelModal(true);
  };

  /**
   * Cierra el modal de cancelación y limpia la selección almacenada.
   */
  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setReservationToCancel(null);
    setCancelError(null);
  };

  /**
   * Oculta el mensaje de notificación activo.
   */
  const handleDismissNotification = () => {
    setNotification(null);
  };

  /**
   * Confirma la cancelación invocando el servicio del backend.
   */
  const handleConfirmCancellation = async () => {
    if (!reservationToCancel) {
      return;
    }

    try {
      setIsCancelling(true);
      setCancelError(null);
      await cancelarReserva(reservationToCancel.id_reserva, token);
      setNotification({
        type: 'success',
        message: 'La reserva se canceló correctamente.'
      });
      await loadReservations();
      handleCloseCancelModal();
    } catch (err) {
      const message = err?.error || err?.message || 'No se pudo cancelar la reserva. Intente nuevamente.';
      setCancelError(message);
    } finally {
      setIsCancelling(false);
    }
  };



  const getPagoBadge = (estaPagada) => {

    return estaPagada ? (

      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">

        <Check size={14} /> Pagada

      </span>

    ) : (

      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">

        <Clock size={14} /> Pendiente

      </span>

    );

  };



  const formatDate = (dateString) => {

    if (!dateString) return '-';

    try {

      const date = new Date(dateString);

      const day = String(date.getDate()).padStart(2, '0');

      const month = String(date.getMonth() + 1).padStart(2, '0');

      const year = date.getFullYear();

      return `${day}/${month}/${year}`;

    } catch (e) {

      return dateString;

    }

  };



  const calculateNights = (checkIn, checkOut) => {

    if (!checkIn || !checkOut) return 0;

    try {

      const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));

      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    } catch (e) {

      return 0;

    }

  };



  if (loading) {

    return (

      <div className="min-h-screen bg-gray-50 p-8">

        <div className="max-w-7xl mx-auto">

          <div className="bg-white rounded-lg shadow-md p-12 flex flex-col items-center justify-center">

            <Loader2 className="animate-spin h-12 w-12 text-blue-500 mb-4" />

            <span className="text-lg font-medium text-gray-700">Cargando reservas...</span>

          </div>

        </div>

      </div>

    );

  }



  if (error) {

    return (

      <div className="min-h-screen bg-gray-50 p-8">

        <div className="max-w-7xl mx-auto">

          <div className="bg-white rounded-lg shadow-md p-8">

            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start gap-3">

              <XCircle size={24} className="flex-shrink-0 mt-0.5" />

              <div>

                <p className="text-lg font-semibold mb-1">Error al cargar las reservas</p>

                <p className="text-sm">{error}</p>

              </div>

            </div>

            {onClose && (

              <button

                onClick={onClose}

                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition text-sm"

              >

                <ArrowLeft size={18} />

                Volver al panel

              </button>

            )}

          </div>

        </div>

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-gray-50 p-8">

      <div className="max-w-7xl mx-auto">

        {onClose && (

          <button

            onClick={onClose}

            className="mb-6 flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"

          >

            <ArrowLeft size={20} />

            Volver al panel

          </button>

        )}



        <div className="mb-8">

          <div className="flex items-center gap-3">

            <div className="p-3 bg-blue-500 rounded-lg">

              <Calendar size={32} className="text-white" />

            </div>

            <div>

              <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>

              <p className="text-gray-600">Consulta y administra tus reservas activas e historicas</p>

            </div>

          </div>

        </div>

        {notification && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-lg border px-4 py-3 ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="mt-0.5">
              {notification.type === 'success' ? <Check size={18} /> : <XCircle size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              type="button"
              onClick={handleDismissNotification}
              className="text-current hover:opacity-70 transition"
              aria-label="Cerrar notificación"
            >
              <X size={16} />
            </button>
          </div>
        )}

      {/* Filtros */}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

          <div className="md:col-span-1">

            <label className="block text-sm font-semibold text-gray-700 mb-2">

              <Search size={16} className="inline mr-1" />

              Buscar por codigo

            </label>

            <input

              type="text"

              name="cod_reserva"

              value={filters.cod_reserva}

              onChange={handleFilterChange}

              placeholder="Ej: RES-20250130-00001"

              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

            />

          </div>



          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">

              <Filter size={16} className="inline mr-1" />

              Estado operativo

            </label>

            <select

              id="estado_operativo"

              name="estado_operativo"

              value={filters.estado_operativo}

              onChange={handleFilterChange}

              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

            >

              {estadosOperativos.map((estado) => (

                <option key={estado.id} value={estado.id}>

                  {estado.nombre}

                </option>

              ))}

            </select>

          </div>



          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">

              Estado de pago

            </label>

            <select

              id="esta_pagada"

              name="esta_pagada"

              value={filters.esta_pagada}

              onChange={handleFilterChange}

              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

            >

              {estadosPago.map((estado) => (

                <option key={estado.id} value={estado.id}>

                  {estado.nombre}

                </option>

              ))}

            </select>

          </div>

        </div>



        <div className="border-t border-gray-200 pt-4 mt-4">

          <label className="block text-sm font-semibold text-gray-700 mb-3">

            <Calendar size={16} className="inline mr-1" />

            Fecha de reserva

          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>

              <label className="block text-xs text-gray-600 mb-1">Selecciona una fecha</label>

              <input

                type="date"

                id="fecha"

                name="fecha"

                value={filters.fecha}

                onChange={handleFilterChange}

                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

              />

            </div>

            <div className="bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-lg p-4">

              Filtra reservas por la fecha de check-in o check-out.

            </div>

          </div>

        </div>



        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">

          <button

            onClick={resetFilters}

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



      {/* Lista de reservas */}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">

        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">

          <p className="text-sm text-gray-700">

            Mostrando <span className="font-semibold">{filteredReservas.length}</span> reserva(s)

          </p>

        </div>

        {filteredReservas.length === 0 ? (

          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">

            <Calendar size={64} className="text-gray-300 mb-4" />

            <p className="text-lg font-semibold text-gray-700 mb-1">No hay reservas</p>

            <p className="text-gray-500 text-sm">

              {reservas.length === 0

                ? 'Aun no has realizado ninguna reserva.'

                : 'No se encontraron reservas que coincidan con los filtros seleccionados.'}

            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200">

              <thead className="bg-gray-50 border-b border-gray-200">

                <tr>

                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">

                    Codigo

                  </th>

                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">

                    Cabana

                  </th>

                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">

                    Fechas

                  </th>

                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">

                    Estado

                  </th>

                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">

                    Pago

                  </th>

                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">

                    Total

                  </th>

                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">

                    Acciones

                  </th>

                </tr>

              </thead>

              <tbody className="bg-white divide-y divide-gray-200">

                {filteredReservas.map((reserva) => {
                  const isConfirmedReservation = Number(reserva.id_est_op) === 1;
                  const cabinsLabel = reserva.cantidad_cabanas
                    ? `${reserva.cantidad_cabanas} cabana${reserva.cantidad_cabanas > 1 ? 's' : ''}`
                    : 'No especificada';

                  return (
                    <tr key={reserva.id_reserva} className="hover:bg-gray-50 transition">

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">

                      {reserva.cod_reserva || 'N/A'}

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">

                      {cabinsLabel}

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">

                      <div className="flex flex-col gap-0.5">

                        <span>Check-in: {formatDate(reserva.check_in)}</span>

                        <span>Check-out: {formatDate(reserva.check_out)}</span>

                        <span className="text-xs text-gray-400">

                          {(reserva.noches || calculateNights(reserva.check_in, reserva.check_out)) || 0} noches

                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">

                      <span

                        className={`px-2 py-1 text-xs font-medium rounded-full ${

                          reserva.estado_operativo === 'Confirmada'

                            ? 'bg-green-100 text-green-800'

                            : reserva.estado_operativo === 'Cancelada'

                            ? 'bg-red-100 text-red-800'

                            : reserva.estado_operativo === 'Finalizada'

                            ? 'bg-blue-100 text-blue-800'

                            : 'bg-yellow-100 text-yellow-800'

                        }`}

                      >

                        {reserva.estado_operativo || 'Pendiente'}

                      </span>

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">

                      {getPagoBadge(reserva.esta_pagada)}

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">

                      ${parseFloat(reserva.monto_total_res || 0).toLocaleString('es-AR')}

                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">

                      <div className="flex items-center gap-2">

                        <button

                          type="button"

                          onClick={() => handleViewDetails(reserva)}

                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"

                          title="Ver detalles"

                        >

                          <Eye size={18} />

                        </button>

                        {isConfirmedReservation && (
                          <button
                            type="button"
                            onClick={() => handleOpenCancelModal(reserva)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Cancelar reserva"
                          >
                            <X size={18} />
                          </button>
                        )}

                      </div>

                    </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>



      {/* Modal de detalle de reserva */}

      {showDetailModal && selectedReservation && (

        <ReservationDetailModal

          reservation={selectedReservation}

          onClose={handleCloseDetailModal}

        />

      )}

      {/* Modal de cancelación */}
      <CancelReservationModal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancellation}
        isLoading={isCancelling}
        reservationCode={reservationToCancel?.cod_reserva}
        checkInDate={reservationToCancel?.check_in}
        cabinsDescription={
          reservationToCancel?.cantidad_cabanas
            ? `${reservationToCancel.cantidad_cabanas} cabana${
                reservationToCancel.cantidad_cabanas > 1 ? 's' : ''
              }`
            : undefined
        }
        errorMessage={cancelError}
      />

      </div>

    </div>

  );

}
