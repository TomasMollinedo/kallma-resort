/**
 * Servicio de API para gestión de tipos de cabaña
 * Endpoints disponibles solo para Operadores y Administradores
 */

import { authenticatedRequest } from './api';

const BASE_URL = '/tipo-cabana';

/**
 * Obtener todos los tipos de cabaña con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @param {boolean} filters.esta_activo - Filtrar por estado activo/inactivo
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Lista de tipos de cabaña
 */
export const getAllTiposCabana = async (filters = {}, token) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.esta_activo !== undefined) {
      params.append('esta_activo', filters.esta_activo);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

    return await authenticatedRequest(endpoint, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener detalle de un tipo de cabaña por ID
 * @param {number} id - ID del tipo de cabaña
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Detalle completo del tipo de cabaña
 */
export const getTipoCabanaById = async (id, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/${id}`, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};
