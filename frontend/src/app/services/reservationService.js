import { authenticatedRequest } from './api';

const API_URL = 'http://localhost:4000/api';

/**
 * Servicio de API para gestión de reservas
 * Endpoints disponibles para Administradores y Operadores
 */

/**
 * Obtener lista de todas las reservas con filtros
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.cod_reserva - Búsqueda parcial por código de reserva
 * @param {string} filters.fecha_desde - Fecha desde (YYYY-MM-DD)
 * @param {string} filters.fecha_hasta - Fecha hasta (YYYY-MM-DD)
 * @param {string} filters.arrivals_on - Llegadas en fecha específica (YYYY-MM-DD)
 * @param {string} filters.departures_on - Salidas en fecha específica (YYYY-MM-DD)
 * @param {string} filters.inhouse_on - Hospedados en fecha específica (YYYY-MM-DD)
 * @param {number} filters.id_est_op - Filtrar por ID de estado operativo
 * @param {boolean} filters.esta_pagada - Filtrar por estado de pago
 * @param {string} token - Token JWT
 * @returns {Promise} Lista de reservas
 */
export const getAllReservations = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.cod_reserva) queryParams.append('cod_reserva', filters.cod_reserva);
    if (filters.fecha_desde) queryParams.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) queryParams.append('fecha_hasta', filters.fecha_hasta);
    if (filters.arrivals_on) queryParams.append('arrivals_on', filters.arrivals_on);
    if (filters.departures_on) queryParams.append('departures_on', filters.departures_on);
    if (filters.inhouse_on) queryParams.append('inhouse_on', filters.inhouse_on);
    if (filters.id_est_op) queryParams.append('id_est_op', filters.id_est_op);
    if (filters.esta_pagada !== undefined) queryParams.append('esta_pagada', filters.esta_pagada);
    
    const endpoint = `/reservas${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await authenticatedRequest(endpoint, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener detalle completo de una reserva
 * @param {number} reservationId - ID de la reserva
 * @param {string} token - Token JWT
 * @returns {Promise} Datos completos de la reserva
 */
export const getReservationById = async (reservationId, token) => {
  try {
    return await authenticatedRequest(`/reservas/${reservationId}`, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar estado de una reserva (liberar: No show, Finalizada)
 * @param {number} reservationId - ID de la reserva
 * @param {Object} data - Datos a actualizar
 * @param {number} data.id_est_op - ID del nuevo estado operativo
 * @param {string} token - Token JWT
 * @returns {Promise} Reserva actualizada
 */
export const updateReservationStatus = async (reservationId, data, token) => {
  try {
    return await authenticatedRequest(
      `/reservas/${reservationId}/status`, 
      'PATCH', 
      data, 
      token
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Función auxiliar para obtener los estados operativos disponibles
 * @returns {Array} Lista de estados con id y nombre
 */
export const getOperationalStates = () => {
  return [
    { id: 1, nombre: 'Cancelada', color: 'red' },
    { id: 2, nombre: 'Confirmada', color: 'green' },
    { id: 3, nombre: 'No aparecio', color: 'yellow' },
    { id: 4, nombre: 'Finalizada', color: 'blue' }
  ];
};

/**
 * Función auxiliar para formatear fecha en formato legible
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada (DD/MM/YYYY)
 */
export const formatDate = (fecha) => {
  if (!fecha) return '-';
  const date = new Date(fecha + 'T00:00:00');
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Función auxiliar para calcular noches de estadía
 * @param {string} checkIn - Fecha check-in (YYYY-MM-DD)
 * @param {string} checkOut - Fecha check-out (YYYY-MM-DD)
 * @returns {number} Cantidad de noches
 */
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const inicio = new Date(checkIn + 'T00:00:00');
  const fin = new Date(checkOut + 'T00:00:00');
  const diffTime = Math.abs(fin - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Función auxiliar para obtener el color del badge según el estado
 * @param {string} estado - Nombre del estado operativo
 * @returns {string} Clases CSS para el badge
 */
export const getStatusBadgeColor = (estado) => {
  const colors = {
    'Confirmada': 'bg-green-100 text-green-800 border-green-300',
    'Cancelada': 'bg-red-100 text-red-800 border-red-300',
    'No aparecio': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Finalizada': 'bg-blue-100 text-blue-800 border-blue-300'
  };
  return colors[estado] || 'bg-gray-100 text-gray-800 border-gray-300';
};

/**
 * Función auxiliar para obtener la fecha de hoy en formato YYYY-MM-DD
 * @returns {string} Fecha de hoy
 */
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};
