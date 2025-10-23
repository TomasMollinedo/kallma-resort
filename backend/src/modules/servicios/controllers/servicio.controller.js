/**
 * Controladores para el módulo de Servicios
 * Maneja las peticiones HTTP y delega la lógica a los services
 */

import * as servicioService from "../services/servicio.service.js";
import {
  validateCreateServicio,
  validateUpdateServicio,
} from "../schemas/servicio.schemas.js";

/**
 * GET /api/servicios
 * Listar todos los servicios
 * Endpoint PÚBLICO para el flujo del cliente
 */
export const listarServicios = async (req, res) => {
  try {
    const servicios = await servicioService.obtenerServicios();

    res.json({
      ok: true,
      data: servicios,
      total: servicios.length,
    });
  } catch (error) {
    console.error("Error en listarServicios:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Error al obtener los servicios",
    });
  }
};

/**
 * GET /api/servicios/:id
 * Obtener detalle de un servicio específico
 */
export const obtenerServicio = async (req, res) => {
  try {
    const idServicio = parseInt(req.params.id);

    if (isNaN(idServicio)) {
      return res.status(400).json({
        ok: false,
        error: "ID de servicio inválido",
      });
    }

    const servicio = await servicioService.obtenerServicioPorId(idServicio);

    res.json({
      ok: true,
      data: servicio,
    });
  } catch (error) {
    console.error("Error en obtenerServicio:", error);

    if (error.message === "SERVICIO_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        error: "Servicio no encontrado",
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al obtener el servicio",
    });
  }
};

/**
 * POST /api/servicios
 * Crear un nuevo servicio
 * Solo Admin
 */
export const crearServicio = async (req, res) => {
  try {
    // Validar datos de entrada
    const validation = validateCreateServicio(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    const servicio = await servicioService.crearServicio(req.body);

    res.status(201).json({
      ok: true,
      message: "Servicio creado exitosamente",
      data: servicio,
    });
  } catch (error) {
    console.error("Error en crearServicio:", error);

    if (error.message.includes("Ya existe un servicio")) {
      return res.status(409).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al crear el servicio",
    });
  }
};

/**
 * PATCH /api/servicios/:id
 * Actualizar un servicio existente
 * Solo Admin
 */
export const actualizarServicio = async (req, res) => {
  try {
    const idServicio = parseInt(req.params.id);

    if (isNaN(idServicio)) {
      return res.status(400).json({
        ok: false,
        error: "ID de servicio inválido",
      });
    }

    // Validar datos de entrada
    const validation = validateUpdateServicio(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    const servicio = await servicioService.actualizarServicio(
      idServicio,
      req.body
    );

    res.json({
      ok: true,
      message: "Servicio actualizado exitosamente",
      data: servicio,
    });
  } catch (error) {
    console.error("Error en actualizarServicio:", error);

    if (error.message.includes("no existe")) {
      return res.status(404).json({
        ok: false,
        error: error.message,
      });
    }

    if (error.message.includes("Ya existe otro servicio")) {
      return res.status(409).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al actualizar el servicio",
    });
  }
};

/**
 * DELETE /api/servicios/:id
 * Eliminar un servicio (eliminación física)
 * Solo Admin
 */
export const eliminarServicio = async (req, res) => {
  try {
    const idServicio = parseInt(req.params.id);

    if (isNaN(idServicio)) {
      return res.status(400).json({
        ok: false,
        error: "ID de servicio inválido",
      });
    }

    const servicio = await servicioService.eliminarServicio(idServicio);

    res.json({
      ok: true,
      message: "Servicio eliminado exitosamente",
      data: servicio,
    });
  } catch (error) {
    console.error("Error en eliminarServicio:", error);

    if (error.message.includes("no existe")) {
      return res.status(404).json({
        ok: false,
        error: error.message,
      });
    }

    if (error.message.includes("tiene reservas asociadas")) {
      return res.status(400).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al eliminar el servicio",
    });
  }
};
