import axios from 'axios';

const API_URL = 'http://localhost:4000/api';
const CANCEL_STATE_ID = 2;

/**
 * Consultar disponibilidad de cabañas
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} params.check_in - Fecha de check-in (YYYY-MM-DD)
 * @param {string} params.check_out - Fecha de check-out (YYYY-MM-DD)
 * @param {number} params.cant_personas - Cantidad de personas
 * @returns {Promise} Respuesta con las cabañas disponibles
 */
export const consultarDisponibilidad = async ({ check_in, check_out, cant_personas }) => {
  try {
    const response = await axios.post(`${API_URL}/reservas/disponibilidad`, {
      check_in,
      check_out,
      cant_personas: parseInt(cant_personas)
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al consultar disponibilidad' };
  }
};

/**
 * Crear una nueva reserva
 * @param {Object} reservaData - Datos de la reserva
 * @param {string} token - Token de autenticación
 * @returns {Promise} Respuesta con los datos de la reserva creada
 */
export const crearReserva = async (reservaData, token) => {
  try {
    const response = await axios.post(`${API_URL}/reservas`, reservaData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al crear la reserva' };
  }
};

/**
 * Obtener las reservas del usuario autenticado
 * @param {string} token - Token de autenticación
 * @returns {Promise} Respuesta con las reservas del usuario
 */
export const obtenerMisReservas = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/reservas/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener las reservas' };
  }
};

/**
 * Cancelar una reserva del cliente autenticado actualizando su estado operativo.
 * @param {number} idReserva - Identificador de la reserva a cancelar.
 * @param {string} token - Token de autenticación JWT.
 * @returns {Promise} Respuesta del backend con la reserva actualizada.
 */
export const cancelarReserva = async (idReserva, token) => {
  try {
    const response = await axios.patch(
      `${API_URL}/reservas/${idReserva}/status`,
      { id_est_op: CANCEL_STATE_ID },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al cancelar la reserva' };
  }
};

/**
 * Obtener servicios disponibles (público - sin autenticación)
 * @returns {Promise} Respuesta con los servicios disponibles
 */
export const obtenerServicios = async () => {
  try {
    const response = await axios.get(`${API_URL}/servicios`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Error al obtener los servicios' };
  }
};
