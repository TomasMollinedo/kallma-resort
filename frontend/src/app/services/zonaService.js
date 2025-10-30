/**
 * Servicio para gestión de Zonas
 * Maneja todas las operaciones CRUD de zonas
 */

import { authenticatedRequest } from './api';

const BASE_URL = '/zonas';

/**
 * Obtener todas las zonas con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @param {boolean} filters.esta_activa - Filtrar por estado activo/inactivo
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Lista de zonas
 */
export const getAllZonas = async (filters = {}, token) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.esta_activa !== undefined) {
      params.append('esta_activa', filters.esta_activa);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

    return await authenticatedRequest(endpoint, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener detalle de una zona por ID
 * Incluye contador de cabañas activas
 * @param {number} id - ID de la zona
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Detalle completo de la zona
 */
export const getZonaById = async (id, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/${id}`, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Crear una nueva zona
 * @param {Object} zonaData - Datos de la zona
 * @param {string} zonaData.nom_zona - Nombre de la zona (obligatorio)
 * @param {number} zonaData.capacidad_cabanas - Capacidad de cabañas (obligatorio)
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Zona creada
 */
export const createZona = async (zonaData, token) => {
  try {
    return await authenticatedRequest(BASE_URL, 'POST', zonaData, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar una zona existente
 * @param {number} id - ID de la zona
 * @param {Object} zonaData - Datos a actualizar
 * @param {string} zonaData.nom_zona - Nombre de la zona (opcional)
 * @param {number} zonaData.capacidad_cabanas - Capacidad de cabañas (opcional)
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Zona actualizada
 */
export const updateZona = async (id, zonaData, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/${id}`, 'PATCH', zonaData, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar una zona (borrado lógico - solo Admin)
 * Cambia esta_activa a FALSE
 * @param {number} id - ID de la zona
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Zona eliminada
 */
export const deleteZona = async (id, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/${id}`, 'DELETE', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Restaurar una zona eliminada (solo Admin)
 * @param {number} id - ID de la zona
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Zona restaurada
 */
export const restaurarZona = async (id, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/${id}/restaurar`, 'POST', null, token);
  } catch (error) {
    throw error;
  }
};
