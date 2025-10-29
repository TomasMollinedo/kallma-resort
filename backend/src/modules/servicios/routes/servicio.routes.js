/**
 * Rutas del módulo de Servicios
 * Define los endpoints y aplica los middlewares de autenticación y autorización
 */

import { Router } from "express";
import {
  listarServicios,
  obtenerServicio,
  crearServicio,
  actualizarServicio,
  eliminarServicio,
} from "../controllers/servicio.controller.js";
import {
  authenticate,
  requireStaff,
  requireAdmin,
} from "../../users/middlewares/auth.middleware.js";

const router = Router();

/**
 * GET /api/servicios
 * Listar servicios disponibles
 * Acceso: PÚBLICO (sin autenticación) - Para flujo del cliente
 */
router.get("/", listarServicios);

/**
 * GET /api/servicios/:id
 * Detalle de servicio
 * Acceso: Operador / Admin
 */
router.get("/:id", authenticate, requireStaff, obtenerServicio);

/**
 * POST /api/servicios
 * Crear nuevo servicio
 * Acceso: Solo Admin
 */
router.post("/", authenticate, requireAdmin, crearServicio);

/**
 * PATCH /api/servicios/:id
 * Actualizar servicio
 * Acceso: Solo Admin
 */
router.patch("/:id", authenticate, requireAdmin, actualizarServicio);

/**
 * DELETE /api/servicios/:id
 * Eliminar servicio (eliminación física)
 * Solo si no tiene reservas asociadas
 * Acceso: Solo Admin
 */
router.delete("/:id", authenticate, requireAdmin, eliminarServicio);

export default router;
