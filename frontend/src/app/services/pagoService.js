/**
 * Servicio de API para gestión de pagos
 * Maneja todas las operaciones CRUD para el módulo de pagos
 */

import { authenticatedRequest } from './api';

const BASE_URL = '/pagos';

/**
 * Obtener listado de todos los pagos (Solo Staff: Operador/Admin)
 * @param {Object} filters - Filtros de búsqueda
 * @param {string} token - Token JWT
 * @returns {Promise} Respuesta con array de pagos y paginación
 */
export const getAllPagos = async (filters = {}, token) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.cod_reserva) {
      params.append('cod_reserva', filters.cod_reserva);
    }
    if (filters.fecha_desde) {
      params.append('fecha_desde', filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      params.append('fecha_hasta', filters.fecha_hasta);
    }
    if (filters.esta_activo !== undefined) {
      params.append('esta_activo', filters.esta_activo);
    }
    if (filters.id_medio_pago) {
      params.append('id_medio_pago', filters.id_medio_pago);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }
    if (filters.offset) {
      params.append('offset', filters.offset);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
    
    return await authenticatedRequest(endpoint, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener pagos propios del cliente autenticado
 * @param {Object} filters - Filtros de búsqueda
 * @param {string} token - Token JWT
 * @returns {Promise} Respuesta con array de pagos propios
 */
export const getMyPagos = async (filters = {}, token) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.cod_reserva) {
      params.append('cod_reserva', filters.cod_reserva);
    }
    if (filters.fecha_desde) {
      params.append('fecha_desde', filters.fecha_desde);
    }
    if (filters.fecha_hasta) {
      params.append('fecha_hasta', filters.fecha_hasta);
    }
    if (filters.esta_activo !== undefined) {
      params.append('esta_activo', filters.esta_activo);
    }
    if (filters.id_medio_pago) {
      params.append('id_medio_pago', filters.id_medio_pago);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `${BASE_URL}/me?${queryString}` : `${BASE_URL}/me`;
    
    return await authenticatedRequest(endpoint, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener detalle completo de un pago específico
 * @param {number} id - ID del pago
 * @param {string} token - Token JWT
 * @returns {Promise} Respuesta con datos completos del pago
 */
export const getPagoById = async (id, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/${id}`, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener historial de pagos de una reserva específica
 * @param {number} idReserva - ID de la reserva
 * @param {string} token - Token JWT
 * @returns {Promise} Respuesta con array de pagos de la reserva
 */
export const getPagosByReserva = async (idReserva, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/reservas/${idReserva}/pagos`, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Registrar un nuevo pago para una reserva (Solo Staff: Operador/Admin)
 * @param {number} idReserva - ID de la reserva
 * @param {Object} pagoData - Datos del pago
 * @param {string} token - Token JWT
 * @returns {Promise} Respuesta con el pago creado
 */
export const createPago = async (idReserva, pagoData, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/reservas/${idReserva}/pagos`, 'POST', pagoData, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Anular un pago (borrado lógico) (Solo Staff: Operador/Admin)
 * @param {number} id - ID del pago
 * @param {string} token - Token JWT
 * @returns {Promise} Respuesta con el pago anulado
 */
export const anularPago = async (id, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/${id}`, 'DELETE', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener lista de medios de pago
 * @returns {Array} Array con los medios de pago disponibles
 */
export const getMediosPago = () => {
  return [
    { id: 1, nombre: 'Efectivo' },
    { id: 2, nombre: 'Tarjeta de débito' },
    { id: 3, nombre: 'Tarjeta de crédito' }
  ];
};

/**
 * Obtener el color del badge según el medio de pago
 * @param {string} medioPago - Nombre del medio de pago
 * @returns {string} Clases CSS para el badge
 */
export const getMedioPagoBadgeColor = (medioPago) => {
  const colors = {
    'Efectivo': 'bg-green-100 text-green-800 border-green-300',
    'Tarjeta de débito': 'bg-blue-100 text-blue-800 border-blue-300',
    'Tarjeta de crédito': 'bg-purple-100 text-purple-800 border-purple-300'
  };
  return colors[medioPago] || 'bg-gray-100 text-gray-800 border-gray-300';
};

/**
 * Formatear fecha para mostrar en la UI
 * @param {string} fecha - Fecha en formato ISO
 * @returns {string} Fecha formateada (DD/MM/YYYY)
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES');
};

/**
 * Validar datos de pago antes de enviar al backend
 * @param {Object} pagoData - Datos del pago
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validatePagoData = (pagoData) => {
  const errors = [];

  // Validar monto
  if (!pagoData.monto || pagoData.monto <= 0) {
    errors.push('El monto debe ser mayor a cero');
  }

  // Validar método de pago
  if (!pagoData.id_medio_pago || ![1, 2, 3].includes(parseInt(pagoData.id_medio_pago))) {
    errors.push('Debe seleccionar un método de pago válido');
  }

  // Validar fecha si se proporciona
  if (pagoData.fecha_pago) {
    const fechaPago = new Date(pagoData.fecha_pago);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaPago > hoy) {
      errors.push('La fecha de pago no puede ser en el futuro');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
