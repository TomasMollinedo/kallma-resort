/**
 * Controladores para el módulo de Reservas
 * Maneja las peticiones HTTP y delega la lógica a los services
 */

import * as reservaService from "../services/reserva.service.js";
import {
  validateDisponibilidad,
  validateCrearReserva,
  validateActualizarEstado,
} from "../schemas/reserva.schemas.js";

/**
 * POST /api/reservas/disponibilidad
 * Consultar disponibilidad de cabañas
 */
export const consultarDisponibilidad = async (req, res) => {
  try {
    const validation = validateDisponibilidad(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    const cabanas = await reservaService.consultarDisponibilidad(req.body);

    res.json({
      ok: true,
      data: cabanas,
      total: cabanas.length,
      parametros: {
        check_in: req.body.check_in,
        check_out: req.body.check_out,
        cant_personas: req.body.cant_personas,
      },
    });
  } catch (error) {
    console.error("Error en consultarDisponibilidad:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Error al consultar disponibilidad",
    });
  }
};

/**
 * POST /api/reservas
 * Crear nueva reserva
 */
export const crearReserva = async (req, res) => {
  try {
    const validation = validateCrearReserva(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    const reserva = await reservaService.crearReserva(
      req.body,
      req.user.id_usuario
    );

    res.status(201).json({
      ok: true,
      message: "Reserva creada exitosamente",
      data: reserva,
    });
  } catch (error) {
    console.error("Error en crearReserva:", error);

    if (
      error.message.includes("no existen") ||
      error.message.includes("no están disponibles") ||
      error.message.includes("ya están reservadas")
    ) {
      return res.status(400).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al crear la reserva",
    });
  }
};

/**
 * GET /api/reservas/me
 * Listar reservas del cliente autenticado
 */
export const listarReservasCliente = async (req, res) => {
  try {
    const filters = {
      id_est_op: req.query.id_est_op ? parseInt(req.query.id_est_op) : undefined,
      esta_pagada:
        req.query.esta_pagada !== undefined
          ? req.query.esta_pagada === "true"
          : undefined,
    };

    const reservas = await reservaService.obtenerReservasCliente(
      req.user.id_usuario,
      filters
    );

    res.json({
      ok: true,
      data: reservas,
      total: reservas.length,
    });
  } catch (error) {
    console.error("Error en listarReservasCliente:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Error al obtener las reservas",
    });
  }
};

/**
 * GET /api/reservas
 * Listar todas las reservas (Operador/Admin)
 */
export const listarTodasReservas = async (req, res) => {
  try {
    const filters = {
      cod_reserva: req.query.cod_reserva,
      check_in: req.query.check_in,
      check_out: req.query.check_out,
      id_est_op: req.query.id_est_op ? parseInt(req.query.id_est_op) : undefined,
      esta_pagada:
        req.query.esta_pagada !== undefined
          ? req.query.esta_pagada === "true"
          : undefined,
    };

    const reservas = await reservaService.obtenerTodasReservas(filters);

    res.json({
      ok: true,
      data: reservas,
      total: reservas.length,
    });
  } catch (error) {
    console.error("Error en listarTodasReservas:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Error al obtener las reservas",
    });
  }
};

/**
 * GET /api/reservas/:id
 * Obtener detalle de una reserva
 */
export const obtenerReserva = async (req, res) => {
  try {
    const idReserva = parseInt(req.params.id);

    if (isNaN(idReserva)) {
      return res.status(400).json({
        ok: false,
        error: "ID de reserva inválido",
      });
    }

    const reserva = await reservaService.obtenerReservaPorId(
      idReserva,
      req.user.id_usuario
    );

    // Si es Cliente, verificar que sea el propietario
    if (req.user.nom_rol === "Cliente") {
      if (reserva.id_usuario_creacion !== req.user.id_usuario) {
        return res.status(403).json({
          ok: false,
          error: "No tiene permisos para ver esta reserva",
        });
      }
    }

    res.json({
      ok: true,
      data: reserva,
    });
  } catch (error) {
    console.error("Error en obtenerReserva:", error);

    if (error.message === "RESERVA_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        error: "Reserva no encontrada",
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al obtener la reserva",
    });
  }
};

/**
 * PATCH /api/reservas/:id/status
 * Actualizar estado de una reserva
 */
export const actualizarEstadoReserva = async (req, res) => {
  try {
    const idReserva = parseInt(req.params.id);

    if (isNaN(idReserva)) {
      return res.status(400).json({
        ok: false,
        error: "ID de reserva inválido",
      });
    }

    const validation = validateActualizarEstado(req.body, req.user.nom_rol);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    const reserva = await reservaService.actualizarEstadoReserva(
      idReserva,
      req.body,
      req.user.id_usuario,
      req.user.nom_rol
    );

    res.json({
      ok: true,
      message: "Estado de reserva actualizado exitosamente",
      data: reserva,
    });
  } catch (error) {
    console.error("Error en actualizarEstadoReserva:", error);

    if (error.message.includes("no existe")) {
      return res.status(404).json({
        ok: false,
        error: error.message,
      });
    }

    if (
      error.message.includes("permisos") ||
      error.message.includes("solo pueden") ||
      error.message.includes("24 horas") ||
      error.message.includes("ya está cancelada")
    ) {
      return res.status(400).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al actualizar el estado de la reserva",
    });
  }
};
