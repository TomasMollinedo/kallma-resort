/**
 * Controladores para el módulo de estadísticas.
 * Orquestan la validación y delegan la lógica al service correspondiente.
 */

import {
  getAdminDashboardStats,
  getOperatorDashboardStats,
} from "../services/stats.service.js";
import {
  validateAdminDashboardParams,
  validateOperatorDashboardParams,
} from "../schemas/stats.schemas.js";

/**
 * Atiende la petición del dashboard de Administración.
 * Valida parámetros, ejecuta la consulta agregada y retorna todas las métricas.
 * @param {import("express").Request} req - Request de Express.
 * @param {import("express").Response} res - Response de Express.
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const validation = validateAdminDashboardParams(req.query);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    const stats = await getAdminDashboardStats();

    return res.status(200).json({
      ok: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error en getAdminDashboard:", error);
    return res.status(500).json({
      ok: false,
      error: "No fue posible obtener las métricas del dashboard de administración.",
    });
  }
};

/**
 * Atiende la petición del dashboard Operador.
 * Calcula métricas operativas del día aprovechando las consultas agregadas del service.
 * @param {import("express").Request} req - Request de Express.
 * @param {import("express").Response} res - Response de Express.
 */
export const getOperatorDashboard = async (req, res) => {
  try {
    const validation = validateOperatorDashboardParams(req.query);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    const stats = await getOperatorDashboardStats(validation.params);

    return res.status(200).json({
      ok: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error en getOperatorDashboard:", error);
    return res.status(500).json({
      ok: false,
      error: "No fue posible obtener las métricas del dashboard operativo.",
    });
  }
};
