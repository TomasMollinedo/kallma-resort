/**
 * Rutas del módulo de estadísticas.
 * Define endpoints de solo lectura protegidos por los middlewares de autenticación.
 */

import { Router } from "express";
import {
  getAdminDashboard,
  getOperatorDashboard,
} from "../controllers/stats.controller.js";
import {
  authenticate,
  requireAdmin,
  requireStaff,
} from "../../users/middlewares/auth.middleware.js";

const router = Router();

/**
 * GET /api/stats/admin-dashboard
 * Acceso: solo Administrador.
 */
router.get("/admin-dashboard", authenticate, requireAdmin, getAdminDashboard);

/**
 * GET /api/stats/operator-dashboard
 * Acceso: Operador y Administrador.
 */
router.get("/operator-dashboard", authenticate, requireStaff, getOperatorDashboard);

export default router;
