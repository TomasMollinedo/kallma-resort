/**
 * Servicio para estadísticas y dashboards
 * Maneja las consultas agregadas para Admin y Operador
 */

import { authenticatedRequest } from './api';

const BASE_URL = '/stats';

/**
 * Obtener estadísticas del dashboard de Administrador
 * Incluye: total de usuarios, cabañas, zonas, ingresos, métodos de pago, etc.
 *
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Datos del dashboard de admin
 *
 * Ejemplo de respuesta esperada:
 * {
 *   totalUsers: 0,
 *   totalCabins: 0,
 *   totalZones: 0,
 *   currentMonthRevenue: 0,
 *   revenueLast12Months: [
 *     { year: 2025, month: 1, total: 0 }
 *   ],
 *   paymentMethodsDistribution: [
 *     { method: 'Tarjeta', count: 10, percentage: 50.0 }
 *   ]
 * }
 */
export const getAdminDashboardStats = async (token) => {
  try {
    const response = await authenticatedRequest(
      `${BASE_URL}/admin-dashboard`,
      'GET',
      null,
      token
    );
    return response?.data ?? response;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener estadísticas del dashboard de Operador
 * Incluye: hospedados hoy, check-ins hoy, check-outs hoy,
 * cabañas en mantenimiento hoy, ocupación del resort.
 *
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Datos del dashboard de operador
 *
 * Ejemplo de respuesta esperada:
 * {
 *   hostedToday: 0,
 *   checkinsToday: 0,
 *   checkoutsToday: 0,
 *   cabinsInMaintenanceToday: 0,
 *   occupancyRate: 0.0
 * }
 */
export const getOperatorDashboardStats = async (token) => {
  try {
    const response = await authenticatedRequest(
      `${BASE_URL}/operator-dashboard`,
      'GET',
      null,
      token
    );
    return response?.data ?? response;
  } catch (error) {
    throw error;
  }
};
