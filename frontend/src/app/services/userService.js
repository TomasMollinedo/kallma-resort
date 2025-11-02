import { authenticatedRequest } from './api';
import { formatIsoDateTimeForDisplay } from '../utils/dateUtils';

const API_URL = 'http://localhost:4000/api';

/**
 * Servicio de API para gestión de usuarios
 * Endpoints disponibles solo para Administradores (excepto getMyProfile)
 */

/**
 * Obtener perfil del usuario autenticado
 * @param {string} token - Token JWT
 * @returns {Promise} Datos del usuario
 */
export const getMyProfile = async (token) => {
  try {
    return await authenticatedRequest('/users/me', 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener lista de todos los usuarios con filtros y búsqueda
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.nombre - Búsqueda parcial por nombre (case-insensitive)
 * @param {string} filters.email - Búsqueda parcial por email (case-insensitive)
 * @param {string} filters.dni - Búsqueda parcial por DNI
 * @param {string} filters.rol - Filtrar por rol (Cliente, Operador, Administrador)
 * @param {boolean} filters.esta_activo - Filtrar por estado activo
 * @param {number} filters.limit - Límite de resultados (default: 100, max: 1000)
 * @param {number} filters.offset - Desplazamiento para paginación (default: 0)
 * @param {string} token - Token JWT
 * @returns {Promise} Lista de usuarios y paginación
 */
export const getAllUsers = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.nombre) queryParams.append('nombre', filters.nombre);
    if (filters.email) queryParams.append('email', filters.email);
    if (filters.dni) queryParams.append('dni', filters.dni);
    if (filters.rol) queryParams.append('rol', filters.rol);
    if (filters.esta_activo !== undefined) queryParams.append('esta_activo', filters.esta_activo);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset !== undefined) queryParams.append('offset', filters.offset);
    
    const endpoint = `/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await authenticatedRequest(endpoint, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener detalles de un usuario específico
 * @param {number} userId - ID del usuario
 * @param {string} token - Token JWT
 * @returns {Promise} Datos completos del usuario
 */
export const getUserById = async (userId, token) => {
  try {
    return await authenticatedRequest(`/users/${userId}`, 'GET', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Crear un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.email - Email del usuario (obligatorio, único)
 * @param {string} userData.password - Contraseña (obligatorio, mínimo 6 caracteres)
 * @param {string} userData.nombre - Nombre completo (obligatorio, mínimo 2 caracteres)
 * @param {number} userData.id_rol_usuario - ID del rol (1=Cliente, 2=Operador, 3=Administrador)
 * @param {string} userData.telefono - Teléfono (opcional)
 * @param {string} userData.dni - DNI (opcional)
 * @param {string} token - Token JWT
 * @returns {Promise} Usuario creado
 */
export const createUser = async (userData, token) => {
  try {
    return await authenticatedRequest('/users', 'POST', userData, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar un usuario existente (actualización parcial)
 * @param {number} userId - ID del usuario a actualizar
 * @param {Object} userData - Datos a actualizar (todos opcionales)
 * @param {string} userData.nombre - Nombre completo
 * @param {string} userData.telefono - Teléfono
 * @param {string} userData.dni - DNI
 * @param {string} userData.email - Email
 * @param {string} userData.password - Nueva contraseña
 * @param {number} userData.id_rol_usuario - ID del rol
 * @param {boolean} userData.esta_activo - Estado activo
 * @param {string} token - Token JWT
 * @returns {Promise} Usuario actualizado
 */
export const updateUser = async (userId, userData, token) => {
  try {
    return await authenticatedRequest(`/users/${userId}`, 'PATCH', userData, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Desactivar un usuario (borrado lógico)
 * @param {number} userId - ID del usuario a desactivar
 * @param {string} token - Token JWT
 * @returns {Promise} Confirmación de desactivación
 */
export const deleteUser = async (userId, token) => {
  try {
    return await authenticatedRequest(`/users/${userId}`, 'DELETE', null, token);
  } catch (error) {
    throw error;
  }
};

/**
 * Función auxiliar para obtener los roles disponibles
 * @returns {Array} Lista de roles con id y nombre
 */
export const getRoles = () => {
  return [
    { id: 1, nombre: 'Cliente' },
    { id: 2, nombre: 'Operador' },
    { id: 3, nombre: 'Administrador' }
  ];
};

/**
 * Función auxiliar para formatear fecha
 * @param {string} fecha - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return '-';
  return formatIsoDateTimeForDisplay(fecha);
};
