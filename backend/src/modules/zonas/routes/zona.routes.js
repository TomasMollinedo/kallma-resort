/**
 * Rutas del módulo de Zonas
 * Define los endpoints y aplica los middlewares de autenticación y autorización
 */

import { Router } from "express";
import {
  listarZonas,
  obtenerZona,
  crearZona,
  actualizarZona,
  eliminarZona,
  restaurarZona,
} from "../controllers/zona.controller.js";
import {
  requireStaff,
  requireAdmin,
} from "../../users/middlewares/auth.middleware.js";

const router = Router();

/**
 * GET /api/zonas
 * Listar zonas activas
 * Acceso: Operador / Admin
 */
router.get("/", requireStaff, listarZonas);

/**
 * GET /api/zonas/:id
 * Detalle de zona
 * Acceso: Operador / Admin
 */
router.get("/:id", requireStaff, obtenerZona);

/**
 * POST /api/zonas
 * Crear nueva zona
 * Acceso: Solo Admin
 */
router.post("/", requireAdmin, crearZona);

/**
 * PATCH /api/zonas/:id
 * Actualizar zona
 * Acceso: Solo Admin
 */
router.patch("/:id", requireAdmin, actualizarZona);

/**
 * DELETE /api/zonas/:id
 * Eliminar zona (borrado lógico)
 * Acceso: Solo Admin
 */
router.delete("/:id", requireAdmin, eliminarZona);

/**
 * POST /api/zonas/:id/restaurar
 * Restaurar zona eliminada
 * Acceso: Solo Admin
 */
router.post("/:id/restaurar", requireAdmin, restaurarZona);

export default router;
