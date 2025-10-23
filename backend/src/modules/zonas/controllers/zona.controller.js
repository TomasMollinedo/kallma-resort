/**
 * Controladores para el módulo de Zonas
 * Maneja las peticiones HTTP y delega la lógica a los services
 */

import * as zonaService from "../services/zona.service.js";
import {
  validateCreateZona,
  validateUpdateZona,
} from "../schemas/zona.schemas.js";

/**
 * GET /api/zonas
 * Listar todas las zonas
 */
export const listarZonas = async (req, res) => {
  try {
    const filters = {
      esta_activa: req.query.esta_activa !== undefined
        ? req.query.esta_activa === "true"
        : undefined,
    };

    const zonas = await zonaService.obtenerZonas(filters);

    res.json({
      ok: true,
      data: zonas,
      total: zonas.length,
    });
  } catch (error) {
    console.error("Error en listarZonas:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Error al obtener las zonas",
    });
  }
};

/**
 * GET /api/zonas/:id
 * Obtener detalle de una zona específica
 */
export const obtenerZona = async (req, res) => {
  try {
    const idZona = parseInt(req.params.id);

    if (isNaN(idZona)) {
      return res.status(400).json({
        ok: false,
        error: "ID de zona inválido",
      });
    }

    const zona = await zonaService.obtenerZonaPorId(idZona);

    res.json({
      ok: true,
      data: zona,
    });
  } catch (error) {
    console.error("Error en obtenerZona:", error);

    if (error.message === "ZONA_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        error: "Zona no encontrada",
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al obtener la zona",
    });
  }
};

/**
 * POST /api/zonas
 * Crear una nueva zona
 * Solo Admin
 */
export const crearZona = async (req, res) => {
  try {
    // Validar datos de entrada
    const validation = validateCreateZona(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    const zona = await zonaService.crearZona(req.body, req.user.id_usuario);

    res.status(201).json({
      ok: true,
      message: "Zona creada exitosamente",
      data: zona,
    });
  } catch (error) {
    console.error("Error en crearZona:", error);

    if (error.message.includes("Ya existe una zona")) {
      return res.status(409).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al crear la zona",
    });
  }
};

/**
 * PATCH /api/zonas/:id
 * Actualizar una zona existente
 * Solo Admin
 */
export const actualizarZona = async (req, res) => {
  try {
    const idZona = parseInt(req.params.id);

    if (isNaN(idZona)) {
      return res.status(400).json({
        ok: false,
        error: "ID de zona inválido",
      });
    }

    // Validar datos de entrada
    const validation = validateUpdateZona(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    const zona = await zonaService.actualizarZona(
      idZona,
      req.body,
      req.user.id_usuario
    );

    res.json({
      ok: true,
      message: "Zona actualizada exitosamente",
      data: zona,
    });
  } catch (error) {
    console.error("Error en actualizarZona:", error);

    if (error.message.includes("no existe")) {
      return res.status(404).json({
        ok: false,
        error: error.message,
      });
    }

    if (error.message.includes("Ya existe otra zona")) {
      return res.status(409).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al actualizar la zona",
    });
  }
};

/**
 * DELETE /api/zonas/:id
 * Eliminar (borrado lógico) una zona
 * Solo Admin
 */
export const eliminarZona = async (req, res) => {
  try {
    const idZona = parseInt(req.params.id);

    if (isNaN(idZona)) {
      return res.status(400).json({
        ok: false,
        error: "ID de zona inválido",
      });
    }

    const zona = await zonaService.eliminarZona(idZona, req.user.id_usuario);

    res.json({
      ok: true,
      message: "Zona eliminada exitosamente",
      data: zona,
    });
  } catch (error) {
    console.error("Error en eliminarZona:", error);

    if (error.message.includes("no existe")) {
      return res.status(404).json({
        ok: false,
        error: error.message,
      });
    }

    if (
      error.message.includes("ya está eliminada") ||
      error.message.includes("tiene cabañas activas")
    ) {
      return res.status(400).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al eliminar la zona",
    });
  }
};

/**
 * POST /api/zonas/:id/restaurar
 * Restaurar una zona eliminada
 * Solo Admin
 */
export const restaurarZona = async (req, res) => {
  try {
    const idZona = parseInt(req.params.id);

    if (isNaN(idZona)) {
      return res.status(400).json({
        ok: false,
        error: "ID de zona inválido",
      });
    }

    const zona = await zonaService.restaurarZona(idZona, req.user.id_usuario);

    res.json({
      ok: true,
      message: "Zona restaurada exitosamente",
      data: zona,
    });
  } catch (error) {
    console.error("Error en restaurarZona:", error);

    if (error.message.includes("no existe")) {
      return res.status(404).json({
        ok: false,
        error: error.message,
      });
    }

    if (error.message.includes("ya está activa")) {
      return res.status(400).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al restaurar la zona",
    });
  }
};
