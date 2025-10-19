/**
 * Controladores para el módulo de Cabañas
 * Maneja las peticiones HTTP y delega la lógica a los services
 */

import * as cabanaService from "../services/cabana.service.js";
import {
  validateCreateCabana,
  validateUpdateCabanaAdmin,
  validateUpdateCabanaOperador,
} from "../schemas/cabana.schemas.js";

/**
 * GET /api/cabanas
 * Listar todas las cabañas con filtros opcionales
 */
export const listarCabanas = async (req, res) => {
  try {
    const filters = {
      id_est_cab: req.query.id_est_cab
        ? parseInt(req.query.id_est_cab)
        : undefined,
      cod_cabana: req.query.cod_cabana,
      id_zona: req.query.id_zona ? parseInt(req.query.id_zona) : undefined,
      esta_activo:
        req.query.esta_activo !== undefined
          ? req.query.esta_activo === "true"
          : undefined,
    };

    const cabanas = await cabanaService.obtenerCabanas(filters);

    res.json({
      ok: true,
      data: cabanas,
      total: cabanas.length,
    });
  } catch (error) {
    console.error("Error en listarCabanas:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Error al obtener las cabañas",
    });
  }
};

/**
 * GET /api/cabanas/zona/:idZona
 * Listar cabañas por zona
 */
export const listarCabanasPorZona = async (req, res) => {
  try {
    const idZona = parseInt(req.params.idZona);

    if (isNaN(idZona)) {
      return res.status(400).json({
        ok: false,
        error: "ID de zona inválido",
      });
    }

    const cabanas = await cabanaService.obtenerCabanasPorZona(idZona);

    res.json({
      ok: true,
      data: cabanas,
      total: cabanas.length,
    });
  } catch (error) {
    console.error("Error en listarCabanasPorZona:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Error al obtener las cabañas de la zona",
    });
  }
};

/**
 * GET /api/cabanas/reservadas
 * Listar cabañas reservadas para una fecha específica
 * Query param: fecha (formato YYYY-MM-DD), por defecto HOY
 */
export const listarCabanasReservadas = async (req, res) => {
  try {
    let fecha = new Date();

    if (req.query.fecha) {
      fecha = new Date(req.query.fecha);

      if (isNaN(fecha.getTime())) {
        return res.status(400).json({
          ok: false,
          error: "Formato de fecha inválido. Use YYYY-MM-DD",
        });
      }
    }

    const cabanas = await cabanaService.obtenerCabanasReservadas(fecha);

    res.json({
      ok: true,
      data: cabanas,
      total: cabanas.length,
      fecha_consultada: fecha.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error en listarCabanasReservadas:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Error al obtener las cabañas reservadas",
    });
  }
};

/**
 * GET /api/cabanas/:id
 * Obtener detalle de una cabaña específica
 */
export const obtenerCabana = async (req, res) => {
  try {
    const idCabana = parseInt(req.params.id);

    if (isNaN(idCabana)) {
      return res.status(400).json({
        ok: false,
        error: "ID de cabaña inválido",
      });
    }

    const cabana = await cabanaService.obtenerCabanaPorId(idCabana);

    res.json({
      ok: true,
      data: cabana,
    });
  } catch (error) {
    console.error("Error en obtenerCabana:", error);

    if (error.message === "CABANA_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        error: "Cabaña no encontrada",
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al obtener la cabaña",
    });
  }
};

/**
 * POST /api/cabanas
 * Crear una nueva cabaña
 * Solo Admin
 */
export const crearCabana = async (req, res) => {
  try {
    // Validar datos de entrada
    const validation = validateCreateCabana(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    const cabana = await cabanaService.crearCabana(
      req.body,
      req.user.id_usuario
    );

    res.status(201).json({
      ok: true,
      message: "Cabaña creada exitosamente",
      data: cabana,
    });
  } catch (error) {
    console.error("Error en crearCabana:", error);

    if (error.message.includes("Ya existe")) {
      return res.status(409).json({
        ok: false,
        error: error.message,
      });
    }

    if (
      error.message.includes("no existe") ||
      error.message.includes("no está activ")
    ) {
      return res.status(400).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al crear la cabaña",
    });
  }
};

/**
 * PATCH /api/cabanas/:id
 * Actualizar una cabaña
 * Admin: puede actualizar cualquier campo
 * Operador: solo puede cambiar estado entre Activa y Cerrada por Mantenimiento
 */
export const actualizarCabana = async (req, res) => {
  try {
    const idCabana = parseInt(req.params.id);

    if (isNaN(idCabana)) {
      return res.status(400).json({
        ok: false,
        error: "ID de cabaña inválido",
      });
    }

    const esAdmin = req.user.nom_rol === "Administrador";
    const esOperador = req.user.nom_rol === "Operador";

    let cabana;

    if (esAdmin) {
      // Admin puede actualizar cualquier campo
      const validation = validateUpdateCabanaAdmin(req.body);

      if (!validation.isValid) {
        return res.status(400).json({
          ok: false,
          errors: validation.errors,
        });
      }

      cabana = await cabanaService.actualizarCabanaAdmin(
        idCabana,
        req.body,
        req.user.id_usuario
      );
    } else if (esOperador) {
      // Operador solo puede cambiar el estado
      const validation = validateUpdateCabanaOperador(req.body);

      if (!validation.isValid) {
        return res.status(400).json({
          ok: false,
          errors: validation.errors,
        });
      }

      cabana = await cabanaService.actualizarEstadoCabanaOperador(
        idCabana,
        req.body.id_est_cab,
        req.user.id_usuario
      );
    } else {
      return res.status(403).json({
        ok: false,
        error: "No tiene permisos para actualizar cabañas",
      });
    }

    res.json({
      ok: true,
      message: "Cabaña actualizada exitosamente",
      data: cabana,
    });
  } catch (error) {
    console.error("Error en actualizarCabana:", error);

    if (error.message.includes("no existe")) {
      return res.status(404).json({
        ok: false,
        error: error.message,
      });
    }

    if (
      error.message.includes("Ya existe") ||
      error.message.includes("inactiva") ||
      error.message.includes("inválido")
    ) {
      return res.status(400).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al actualizar la cabaña",
    });
  }
};

/**
 * DELETE /api/cabanas/:id
 * Eliminar (borrado lógico) una cabaña
 * Solo Admin - Cambia esta_activo a FALSE
 */
export const eliminarCabana = async (req, res) => {
  try {
    const idCabana = parseInt(req.params.id);

    if (isNaN(idCabana)) {
      return res.status(400).json({
        ok: false,
        error: "ID de cabaña inválido",
      });
    }

    const cabana = await cabanaService.eliminarCabana(
      idCabana,
      req.user.id_usuario
    );

    res.json({
      ok: true,
      message: "Cabaña eliminada exitosamente",
      data: cabana,
    });
  } catch (error) {
    console.error("Error en eliminarCabana:", error);

    if (error.message.includes("no existe")) {
      return res.status(404).json({
        ok: false,
        error: error.message,
      });
    }

    if (
      error.message.includes("ya está eliminada") ||
      error.message.includes("tiene reservas activas")
    ) {
      return res.status(400).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al eliminar la cabaña",
    });
  }
};

/**
 * POST /api/cabanas/:id/restaurar
 * Restaurar una cabaña eliminada
 * Solo Admin
 */
export const restaurarCabana = async (req, res) => {
  try {
    const idCabana = parseInt(req.params.id);

    if (isNaN(idCabana)) {
      return res.status(400).json({
        ok: false,
        error: "ID de cabaña inválido",
      });
    }

    const cabana = await cabanaService.restaurarCabana(
      idCabana,
      req.user.id_usuario
    );

    res.json({
      ok: true,
      message: "Cabaña restaurada exitosamente",
      data: cabana,
    });
  } catch (error) {
    console.error("Error en restaurarCabana:", error);

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
      error: error.message || "Error al restaurar la cabaña",
    });
  }
};
