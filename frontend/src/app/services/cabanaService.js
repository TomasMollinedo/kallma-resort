/**
 * Servicio para gestión de Cabañas
 * Maneja todas las operaciones CRUD y consultas especiales
 */

import { authenticatedRequest } from './api';
import { formatIsoDateTimeForDisplay } from '../utils/dateUtils';

const BASE_URL = '/cabanas';

/**
 * Obtener todas las cabañas con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @param {string} filters.cod_cabana - Código de cabaña (búsqueda parcial)
 * @param {number} filters.id_zona - ID de la zona
 * @param {boolean} filters.esta_activo - Estado activo/inactivo
 * @param {boolean} filters.en_mantenimiento - Estado de mantenimiento
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Lista de cabañas
 */
export const getAllCabanas = async (filters = {}, token) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.cod_cabana) params.append('cod_cabana', filters.cod_cabana);
    if (filters.id_zona) params.append('id_zona', filters.id_zona);
    if (filters.esta_activo !== undefined) params.append('esta_activo', filters.esta_activo);
    if (filters.en_mantenimiento !== undefined) params.append('en_mantenimiento', filters.en_mantenimiento);

    const queryString = params.toString();
    const endpoint = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

    return await authenticatedRequest(endpoint, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener cabañas reservadas para una fecha específica
 * @param {string} fecha - Fecha en formato YYYY-MM-DD (opcional, por defecto HOY)
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Lista de cabañas reservadas
 */
export const getCabanasReservadas = async (fecha = null, token) => {
  try {
    const params = fecha ? `?fecha=${fecha}` : '';
    return await authenticatedRequest(`${BASE_URL}/reservadas${params}`, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener cabañas de una zona específica
 * @param {number} idZona - ID de la zona
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Lista de cabañas de la zona
 */
export const getCabanasPorZona = async (idZona, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/zona/${idZona}`, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener detalle de una cabaña por ID
 * @param {number} id - ID de la cabaña
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Detalle completo de la cabaña
 */
export const getCabanaById = async (id, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/${id}`, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Crear una nueva cabaña
 * @param {Object} cabanaData - Datos de la cabaña
 * @param {string} cabanaData.cod_cabana - Código de la cabaña (obligatorio)
 * @param {number} cabanaData.id_tipo_cab - ID del tipo de cabaña (obligatorio)
 * @param {number} cabanaData.id_zona - ID de la zona (obligatorio)
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Cabaña creada
 */
export const createCabana = async (cabanaData, token) => {
  try {
    return await authenticatedRequest(BASE_URL, 'POST', cabanaData, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar una cabaña (Admin o Operador)
 * Admin: puede actualizar cualquier campo
 * Operador: solo puede actualizar en_mantenimiento
 * @param {number} id - ID de la cabaña
 * @param {Object} cabanaData - Datos a actualizar
 * @param {string} cabanaData.cod_cabana - Código de la cabaña (opcional - solo Admin)
 * @param {number} cabanaData.id_tipo_cab - ID del tipo (opcional - solo Admin)
 * @param {number} cabanaData.id_zona - ID de la zona (opcional - solo Admin)
 * @param {boolean} cabanaData.en_mantenimiento - Estado de mantenimiento (opcional - Admin y Operador)
 * @param {boolean} cabanaData.esta_activo - Estado activo (opcional - solo Admin)
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Cabaña actualizada
 */
export const updateCabana = async (id, cabanaData, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/${id}`, 'PATCH', cabanaData, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza exclusivamente el estado de mantenimiento de una cabaña (Operador/Admin).
 * @param {number} id - ID de la cabaña.
 * @param {boolean} enMantenimiento - Nuevo estado de mantenimiento.
 * @param {string} token - Token JWT.
 * @returns {Promise<Object>} Respuesta del backend con la cabaña actualizada.
 */
export const updateCabanaMaintenance = async (id, enMantenimiento, token) => {
  try {
    return await authenticatedRequest(
      `${BASE_URL}/${id}/mantenimiento`,
      'PATCH',
      { en_mantenimiento: enMantenimiento },
      token
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar una cabaña (borrado lógico - solo Admin)
 * Cambia esta_activo a FALSE
 * @param {number} id - ID de la cabaña
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Cabaña eliminada
 */
export const deleteCabana = async (id, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/${id}`, 'DELETE', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Restaurar una cabaña eliminada (solo Admin)
 * @param {number} id - ID de la cabaña
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Cabaña restaurada
 */
export const restaurarCabana = async (id, token) => {
  try {
    return await authenticatedRequest(`${BASE_URL}/${id}/restaurar`, 'POST', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Función auxiliar para formatear fechas de auditoría
 * @param {string} fecha - Fecha en formato ISO
 * @returns {string} Fecha formateada (DD/MM/YYYY HH:mm)
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return 'No disponible';
  return formatIsoDateTimeForDisplay(fecha);
};

/**
 * Obtener descripción del estado de la cabaña
 * @param {boolean} estaActivo - Estado activo
 * @param {boolean} enMantenimiento - Estado de mantenimiento
 * @returns {Object} {texto, color, descripcion}
 */
export const getEstadoCabana = (estaActivo, enMantenimiento) => {
  if (!estaActivo) {
    return {
      texto: 'Cabaña Inactiva',
      color: 'red',
      descripcion: ''
    };
  }

  if (enMantenimiento) {
    return {
      texto: 'Activa',
      color: 'yellow',
      descripcion: 'Cabaña activa, actualmente en mantenimiento'
    };
  }

  return {
    texto: 'Activa',
    color: 'green',
    descripcion: 'Cabaña activa y disponible para reservas'
  };
};
