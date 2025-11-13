/**
 * Servicio de consultas
 * Maneja las llamadas al API para el módulo de consultas
 */

import { authenticatedRequest } from './api';

const BASE_URL = '/consultas';

/**
 * Crea una nueva consulta desde el formulario público de contacto.
 * NO requiere autenticación.
 * @param {Object} datosConsulta - Datos de la consulta
 * @param {string} datosConsulta.nomCli - Nombre del cliente
 * @param {string} datosConsulta.emailCli - Email del cliente
 * @param {string} datosConsulta.titulo - Título de la consulta (opcional)
 * @param {string} datosConsulta.mensajeCli - Mensaje del cliente
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const crearConsulta = async (datosConsulta) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosConsulta),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear la consulta');
    }

    return data;
  } catch (error) {
    console.error('Error en crearConsulta:', error);
    throw error;
  }
};

/**
 * Obtiene todas las consultas con filtros opcionales.
 * Requiere autenticación (Operador/Admin).
 * @param {Object} filtros - Filtros opcionales
 * @param {boolean} filtros.estaRespondida - true=respondidas, false=pendientes (por defecto: false)
 * @param {string} filtros.periodo - 'hoy', 'semana', 'mes', 'todo' (por defecto: 'todo')
 * @param {string} filtros.busqueda - Texto para buscar en nombre, email o título
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Lista de consultas
 */
export const getAllConsultas = async (filtros = {}, token) => {
  try {
    const params = new URLSearchParams();

    if (filtros.estaRespondida !== undefined) {
      params.append('estaRespondida', filtros.estaRespondida);
    }

    if (filtros.periodo) {
      params.append('periodo', filtros.periodo);
    }

    if (filtros.busqueda) {
      params.append('busqueda', filtros.busqueda);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

    return await authenticatedRequest(endpoint, 'GET', null, token);
  } catch (error) {
    console.error('Error en getAllConsultas:', error);
    throw error;
  }
};

/**
 * Obtiene el detalle de una consulta específica.
 * Requiere autenticación (Operador/Admin).
 * @param {number} id - ID de la consulta
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Detalle de la consulta
 */
export const getConsultaById = async (id, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/${id}`, 'GET', null, token);
  } catch (error) {
    console.error('Error en getConsultaById:', error);
    throw error;
  }
};

/**
 * Responde una consulta y envía un email automático al cliente.
 * Requiere autenticación (Operador/Admin).
 * @param {number} id - ID de la consulta a responder
 * @param {Object} respuestaData - Datos de la respuesta
 * @param {string} respuestaData.respuestaOp - Respuesta del operador
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Consulta actualizada
 */
export const responderConsulta = async (id, respuestaData, token) => {
  try {
    return await authenticatedRequest(
      `${BASE_URL}/${id}/responder`,
      'POST',
      respuestaData,
      token
    );
  } catch (error) {
    console.error('Error en responderConsulta:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de las consultas.
 * Requiere autenticación (Operador/Admin).
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Estadísticas de consultas
 */
export const getEstadisticasConsultas = async (token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/estadisticas`, 'GET', null, token);
  } catch (error) {
    console.error('Error en getEstadisticasConsultas:', error);
    throw error;
  }
};

/**
 * Formatea una fecha a formato local legible.
 * @param {string} fecha - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatea una fecha a formato de solo fecha.
 * @param {string} fecha - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatearFechaCorta = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
