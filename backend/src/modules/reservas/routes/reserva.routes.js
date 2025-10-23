/**
 * Rutas del módulo de Reservas
 * Define los endpoints y aplica los middlewares de autenticación y autorización
 */

import { Router } from "express";
import {
  consultarDisponibilidad,
  crearReserva,
  listarReservasCliente,
  listarTodasReservas,
  obtenerReserva,
  actualizarEstadoReserva,
} from "../controllers/reserva.controller.js";
import {
  authenticate,
  requireStaff,
} from "../../users/middlewares/auth.middleware.js";

const router = Router();

/**
 * POST /api/reservas/disponibilidad
 * Consultar disponibilidad de cabañas para un rango de fechas
 * Body: { check_in, check_out, cant_personas }
 * Acceso: Público (sin autenticación)
 */
router.post("/disponibilidad", consultarDisponibilidad);

/**
 * POST /api/reservas
 * Crear nueva reserva
 * Body: { check_in, check_out, cant_personas, cabanas_ids, servicios_ids? }
 * Acceso: Cualquier usuario autenticado
 */
router.post("/", authenticate, crearReserva);

/**
 * GET /api/reservas/me
 * Listar reservas del cliente autenticado
 * Query params: id_est_op?, esta_pagada?
 * Acceso: Cliente
 */
router.get("/me", authenticate, listarReservasCliente);

/**
 * GET /api/reservas
 * Listar todas las reservas con filtros
 * Query params: cod_reserva?, check_in?, check_out?, id_est_op?, esta_pagada?
 * Acceso: Operador / Admin
 */
router.get("/", authenticate, requireStaff, listarTodasReservas);

/**
 * GET /api/reservas/:id
 * Obtener detalle completo de una reserva
 * Acceso: Cliente (solo sus propias reservas) / Operador / Admin
 */
router.get("/:id", authenticate, obtenerReserva);

/**
 * PATCH /api/reservas/:id/status
 * Actualizar estado de una reserva
 * Cliente: solo puede cambiar a "Cancelada" con restricción de 24h
 * Operador/Admin: pueden cambiar a "No aparecio" o "Finalizada" y estado financiero
 * Acceso: Cliente / Operador / Admin
 */
router.patch("/:id/status", authenticate, actualizarEstadoReserva);

export default router;
