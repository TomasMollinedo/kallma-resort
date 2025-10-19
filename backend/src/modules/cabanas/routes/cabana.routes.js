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
  actualizarCabana,
  eliminarCabana,
  restaurarCabana,
} from "../controllers/cabana.controller.js";
import {
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
router.get("/", requireStaff, listarCabanas);

/**
 * GET /api/cabanas/reservadas
 * Listar cabañas reservadas para una fecha
 * Query params: fecha (YYYY-MM-DD)
 * Acceso: Operador / Admin
 */
router.get("/reservadas", requireStaff, listarCabanasReservadas);

/**
 * GET /api/cabanas/zona/:idZona
 * Listar cabañas por zona
 * Acceso: Operador / Admin
 */
router.get("/zona/:idZona", requireStaff, listarCabanasPorZona);

/**
 * GET /api/cabanas/:id
 * Detalle de cabaña
 * Acceso: Operador / Admin
 */
router.get("/:id", requireStaff, obtenerCabana);

/**
 * POST /api/cabanas
 * Crear nueva cabaña
 * Acceso: Solo Admin
 */
router.post("/", requireAdmin, crearCabana);

/**
 * PATCH /api/cabanas/:id
 * Actualizar cabaña
 * Admin: puede actualizar cualquier campo
 * Operador: solo puede cambiar estado entre Activa y Cerrada por Mantenimiento
 * Acceso: Operador / Admin
 */
router.patch("/:id", requireStaff, actualizarCabana);

/**
 * DELETE /api/cabanas/:id
 * Eliminar cabaña (borrado lógico - cambiar a Inactiva)
 * Acceso: Solo Admin
 */
router.delete("/:id", requireAdmin, eliminarCabana);

/**
 * POST /api/cabanas/:id/restaurar
 * Restaurar cabaña eliminada
 * Acceso: Solo Admin
 */
router.post("/:id/restaurar", requireAdmin, restaurarCabana);

export default router;
