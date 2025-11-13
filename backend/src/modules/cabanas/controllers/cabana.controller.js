/**
 * Controladores para el módulo de Cabañas
 * Maneja las peticiones HTTP y delega la lógica a los services
 */

import * as cabanaService from "../services/cabana.service.js";
import {
  validateCreateCabana,
  validateUpdateCabanaAdmin,
  validateUpdateMantenimientoCabana,
} from "../schemas/cabana.schemas.js";

/**
 * GET /api/cabanas
 * Listar todas las cabañas con filtros opcionales
 */
export const listarCabanas = async (req, res) => {
  try {
    const filters = {
      cod_cabana: req.query.cod_cabana,
      id_zona: req.query.id_zona ? parseInt(req.query.id_zona) : undefined,
      esta_activo:
        req.query.esta_activo !== undefined
          ? req.query.esta_activo === "true"
          : undefined,
      en_mantenimiento:
        req.query.en_mantenimiento !== undefined
          ? req.query.en_mantenimiento === "true"
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

    const fechaActual = new Date();
    let fechaConsulta = fechaActual.toISOString().split("T")[0]; // HOY por defecto

    if (req.query.fecha) {
      // Validar formato YYYY-MM-DD con regex
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(req.query.fecha)) {
        return res.status(400).json({
          ok: false,
          error: "Formato de fecha inválido. Use YYYY-MM-DD",
        });
      }
      
      // Validar que sea una fecha válida
      const partes = req.query.fecha.split('-');
      const fechaTest = new Date(partes[0], partes[1] - 1, partes[2]);
      if (
        fechaTest.getFullYear() != partes[0] ||
        fechaTest.getMonth() != partes[1] - 1 ||
        fechaTest.getDate() != partes[2]
      ) {
        return res.status(400).json({
          ok: false,
          error: "Fecha inválida",
        });
      }

      fechaConsulta = req.query.fecha; // Usar el string directamente
    }

    const cabanas = await cabanaService.obtenerCabanasReservadas(fechaConsulta);

    res.json({
      ok: true,
      data: cabanas,
      total: cabanas.length,
      fecha_consultada: fechaConsulta,
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
 * Actualizar una cabaña (Solo Admin)
 * No permite realizar borrado lógico (esta_activo = false)
 */
export const actualizarCabanaAdmin = async (req, res) => {
  try {
    const idCabana = parseInt(req.params.id);

    if (isNaN(idCabana)) {
      return res.status(400).json({
        ok: false,
        error: "ID de cabaña inválido",
      });
    }

    const validation = validateUpdateCabanaAdmin(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    if (req.body.esta_activo === false) {
      return res.status(400).json({
        ok: false,
        error:
          "Para desactivar una cabaña use el endpoint DELETE /api/cabanas/:id",
      });
    }

    const cabana = await cabanaService.actualizarCabanaAdmin(
      idCabana,
      req.body,
      req.user.id_usuario
    );

    res.json({
      ok: true,
      message: "Cabaña actualizada exitosamente",
      data: cabana,
    });
  } catch (error) {
    console.error("Error en actualizarCabanaAdmin:", error);

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
 * PATCH /api/cabanas/:id/mantenimiento
 * Actualizar exclusivamente el estado de mantenimiento
 * Acceso: Operador / Admin
 */
export const actualizarMantenimientoCabana = async (req, res) => {
  try {
    const idCabana = parseInt(req.params.id);

    if (isNaN(idCabana)) {
      return res.status(400).json({
        ok: false,
        error: "ID de cabaña inválido",
      });
    }

    const validation = validateUpdateMantenimientoCabana(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    const cabana = await cabanaService.actualizarMantenimientoCabana(
      idCabana,
      req.body.en_mantenimiento,
      req.user.id_usuario
    );

    res.json({
      ok: true,
      message: "Estado de mantenimiento actualizado exitosamente",
      data: cabana,
    });
  } catch (error) {
    console.error("Error en actualizarMantenimientoCabana:", error);

    if (error.message.includes("no existe")) {
      return res.status(404).json({
        ok: false,
        error: error.message,
      });
    }

    if (
      error.message.includes("No se puede cambiar el mantenimiento") ||
      error.message.includes("inválido")
    ) {
      return res.status(400).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error:
        error.message || "Error al actualizar el estado de mantenimiento",
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
