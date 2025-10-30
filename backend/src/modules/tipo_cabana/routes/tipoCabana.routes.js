/**
 * Rutas para el módulo de Tipos de Cabaña
 * Endpoints para consultar tipos de cabaña disponibles
 */

import { Router } from "express";
import {listarTiposCabana,obtenerTipoCabana} from "../controllers/tipoCabana.controller.js";
import {
  authenticate,
  requireStaff,
  requireAdmin,
} from "../../users/middlewares/auth.middleware.js";

const router = Router();

/**
 * GET /api/tipo-cabana
 * Listar todos los tipos de cabaña
 * Acceso: Operador y Administrador
 */
router.get("/",authenticate, requireStaff, listarTiposCabana);

/**
 * GET /api/tipo-cabana/:id
 * Obtener detalle de un tipo de cabaña
 * Acceso: Operador y Administrador
 */
router.get("/:id", authenticate, requireStaff, obtenerTipoCabana);

export default router;
