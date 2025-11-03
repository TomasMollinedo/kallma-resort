/**
 * Controladores para el módulo de Pagos
 * Manejan las peticiones HTTP y coordinan las respuestas
 */

import * as pagoService from "../services/pago.service.js";
import * as pagoSchemas from "../schemas/pago.schemas.js";

/**
 * Listar todos los pagos con filtros (Solo Staff)
 */
export const listarPagos = async (req, res) => {
  try {
    // Validar filtros
    const validation = pagoSchemas.validateFiltrosPagos(req.query);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        message: "Errores de validación",
        errors: validation.errors,
      });
    }

    const { pagos, pagination } = await pagoService.obtenerPagos(req.query);

    return res.status(200).json({
      ok: true,
      data: pagos,
      pagination,
    });
  } catch (error) {
    console.error("Error al listar pagos:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener el listado de pagos",
      error: error.message,
    });
  }
};

/**
 * Listar pagos propios del cliente autenticado
 * Los filtros se aplican solo a las reservas del cliente
 */
export const listarPagosPropios = async (req, res) => {
  try {
    const userId = req.userId;

    // Validar filtros (mismos filtros que staff, pero aplicados a sus reservas)
    const validation = pagoSchemas.validateFiltrosPagos(req.query);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        message: "Errores de validación",
        errors: validation.errors,
      });
    }

    const { pagos, pagination } = await pagoService.obtenerPagosPropios(req.query, userId);

    return res.status(200).json({
      ok: true,
      data: pagos,
      pagination,
    });
  } catch (error) {
    console.error("Error al listar pagos propios:", error);
    return res.status(500).json({
      ok: false,
      message: "Error al obtener el listado de pagos",
      error: error.message,
    });
  }
};

/**
 * Obtener detalle de un pago específico
 */
export const obtenerPago = async (req, res) => {
  try {
    const idPago = parseInt(req.params.id);
    const userId = req.userId;
    const userRole = req.userRole;

    // Validar que el ID sea un número válido
    if (isNaN(idPago) || idPago <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID del pago debe ser un número entero positivo",
      });
    }

    const pago = await pagoService.obtenerPagoPorId(idPago, userId, userRole);

    return res.status(200).json({
      ok: true,
      data: pago,
    });
  } catch (error) {
    console.error("Error al obtener pago:", error);

    if (error.message === "PAGO_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        message: "El pago no existe",
      });
    }

    if (error.message === "FORBIDDEN_ACCESS") {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para ver este pago",
      });
    }

    return res.status(500).json({
      ok: false,
      message: "Error al obtener el detalle del pago",
      error: error.message,
    });
  }
};

/**
 * Obtener historial de pagos de una reserva
 */
export const obtenerPagosDeReserva = async (req, res) => {
  try {
    const idReserva = parseInt(req.params.id);
    const userId = req.userId;
    const userRole = req.userRole;

    // Validar que el ID sea un número válido
    if (isNaN(idReserva) || idReserva <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID de la reserva debe ser un número entero positivo",
      });
    }

    const pagos = await pagoService.obtenerPagosPorReserva(idReserva, userId, userRole);

    return res.status(200).json({
      ok: true,
      data: pagos,
      total: pagos.length,
    });
  } catch (error) {
    console.error("Error al obtener pagos de reserva:", error);

    if (error.message === "RESERVA_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        message: "La reserva no existe",
      });
    }

    if (error.message === "FORBIDDEN_ACCESS") {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para ver los pagos de esta reserva",
      });
    }

    return res.status(500).json({
      ok: false,
      message: "Error al obtener los pagos de la reserva",
      error: error.message,
    });
  }
};

/**
 * Registrar un nuevo pago para una reserva
 * Solo Operador y Administrador
 */
export const registrarPago = async (req, res) => {
  try {
    const idReserva = parseInt(req.params.id);
    const userId = req.userId;

    // Validar que el ID sea un número válido
    if (isNaN(idReserva) || idReserva <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID de la reserva debe ser un número entero positivo",
      });
    }

    // Validar datos del pago
    const validation = pagoSchemas.validateCrearPago(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        message: "Errores de validación",
        errors: validation.errors,
      });
    }

    const pago = await pagoService.crearPago(req.body, idReserva, userId);

    return res.status(201).json({
      ok: true,
      message: "Pago registrado exitosamente",
      data: pago,
    });
  } catch (error) {
    console.error("Error al registrar pago:", error);

    if (error.message === "RESERVA_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        message: "La reserva no existe",
      });
    }

    if (error.message.startsWith("RESERVA_NOT_ACTIVE")) {
      const estado = error.message.split(":")[1];
      return res.status(400).json({
        ok: false,
        message: `No se puede registrar un pago para una reserva con estado "${estado}"`,
      });
    }

    if (error.message.startsWith("MONTO_EXCEDE_TOTAL")) {
      const montoRestante = error.message.split(":")[1];
      return res.status(400).json({
        ok: false,
        message: `El monto del pago excede el saldo pendiente de la reserva. Monto restante: ARS $${parseFloat(montoRestante).toFixed(2)}`,
      });
    }

    if (error.message === "MEDIO_PAGO_INVALID") {
      return res.status(400).json({
        ok: false,
        message: "El método de pago no es válido",
      });
    }

    return res.status(500).json({
      ok: false,
      message: "Error al registrar el pago",
      error: error.message,
    });
  }
};

/**
 * Anular un pago (borrado lógico)
 * Solo Operador y Administrador
 */
export const anularPago = async (req, res) => {
  try {
    const idPago = parseInt(req.params.id);
    const userId = req.userId;

    // Validar que el ID sea un número válido
    if (isNaN(idPago) || idPago <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID del pago debe ser un número entero positivo",
      });
    }

    const pago = await pagoService.anularPago(idPago, userId);

    return res.status(200).json({
      ok: true,
      message: "Pago anulado exitosamente",
      data: pago,
    });
  } catch (error) {
    console.error("Error al anular pago:", error);

    if (error.message === "PAGO_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        message: "El pago no existe",
      });
    }

    if (error.message === "PAGO_ALREADY_ANULADO") {
      return res.status(400).json({
        ok: false,
        message: "El pago ya está anulado",
      });
    }

    if (error.message.startsWith("RESERVA_NOT_ACTIVE")) {
      const estado = error.message.split(":")[1];
      return res.status(400).json({
        ok: false,
        message: `No se puede anular un pago de una reserva con estado "${estado}"`,
      });
    }

    return res.status(500).json({
      ok: false,
      message: "Error al anular el pago",
      error: error.message,
    });
  }
};
