/**
 * Rutas del módulo de Cabañas
 * Define los endpoints y aplica los middlewares de autenticación y autorización
 */

import { Router } from "express";
import {
  listarCabanas,
  listarCabanasPorZona,
  listarCabanasReservadas,
  obtenerCabana,
  crearCabana,
  actualizarCabanaAdmin,
  actualizarMantenimientoCabana,
  eliminarCabana,
  restaurarCabana,
} from "../controllers/cabana.controller.js";
import {
  authenticate,
  requireStaff,
  requireAdmin,
} from "../../users/middlewares/auth.middleware.js";

const router = Router();

/**
 * GET /api/cabanas
 * Listar cabañas con filtros opcionales
 * Query params: id_est_cab, cod_cabana, id_zona, esta_activo
 * Acceso: Operador / Admin
 */
router.get("/", authenticate, requireStaff, listarCabanas);

/**
 * GET /api/cabanas/reservadas
 * Listar cabañas reservadas para una fecha
 * Query params: fecha (YYYY-MM-DD)
 * Acceso: Operador / Admin
 */
router.get("/reservadas", authenticate, requireStaff, listarCabanasReservadas);

/**
 * GET /api/cabanas/zona/:idZona
 * Listar cabañas por zona
 * Acceso: Operador / Admin
 */
router.get("/zona/:idZona", authenticate, requireStaff, listarCabanasPorZona);

/**
 * GET /api/cabanas/:id
 * Detalle de cabaña
 * Acceso: Operador / Admin
 */
router.get("/:id", authenticate, requireStaff, obtenerCabana);

/**
 * POST /api/cabanas
 * Crear nueva cabaña
 * Acceso: Solo Admin
 */
router.post("/", authenticate, requireAdmin, crearCabana);

/**
 * PATCH /api/cabanas/:id
 * Actualizar cabaña completa (Solo Admin)
 * No permite cambiar esta_activo a FALSE (usar DELETE)
 */
router.patch("/:id", authenticate, requireAdmin, actualizarCabanaAdmin);

/**
 * PATCH /api/cabanas/:id/mantenimiento
 * Actualizar estado de mantenimiento (Operador/Admin)
 */
router.patch(
  "/:id/mantenimiento",
  authenticate,
  requireStaff,
  actualizarMantenimientoCabana
);

/**
 * DELETE /api/cabanas/:id
 * Eliminar cabaña (borrado lógico - cambiar a Inactiva)
 * Acceso: Solo Admin
 */
router.delete("/:id", authenticate, requireAdmin, eliminarCabana);

/**
 * POST /api/cabanas/:id/restaurar
 * Restaurar cabaña eliminada
 * Acceso: Solo Admin
 */
router.post("/:id/restaurar", authenticate, requireAdmin, restaurarCabana);

export default router;
