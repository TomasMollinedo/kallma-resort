/**
 * Rutas del módulo de Consultas
 * Define los endpoints y aplica los middlewares de autenticación y autorización
 */

import { Router } from "express";
import {
  crearConsulta,
  listarConsultas,
  obtenerConsulta,
  responderConsulta,
  obtenerEstadisticas,
} from "../controllers/consulta.controller.js";
import {
  authenticate,
  requireStaff,
} from "../../users/middlewares/auth.middleware.js";

const router = Router();

/**
 * POST /api/consultas
 * Crear una nueva consulta desde el formulario público de contacto
 * Body: { nomCli, emailCli, titulo?, mensajeCli }
 * Acceso: Público (sin autenticación)
 */
router.post("/", crearConsulta);

/**
 * GET /api/consultas
 * Listar consultas con filtros opcionales
 * Query params:
 *   - estaRespondida: true/false (por defecto: false - muestra solo no respondidas)
 *   - busqueda: texto para buscar en nombre, email o título
 * Acceso: Operador / Administrador
 */
router.get("/", authenticate, requireStaff, listarConsultas);

/**
 * GET /api/consultas/estadisticas
 * Obtener estadísticas de consultas (total, respondidas, pendientes, etc.)
 * Acceso: Operador / Administrador
 * NOTA: Esta ruta debe estar antes de /:id para evitar conflictos
 */
router.get("/estadisticas", authenticate, requireStaff, obtenerEstadisticas);

/**
 * GET /api/consultas/:id
 * Obtener detalle completo de una consulta específica
 * Params: id (número entero)
 * Acceso: Operador / Administrador
 */
router.get("/:id", authenticate, requireStaff, obtenerConsulta);

/**
 * POST /api/consultas/:id/responder
 * Responder una consulta y enviar email al cliente
 * Params: id (número entero)
 * Body: { respuestaOp }
 * Acceso: Operador / Administrador
 */
router.post("/:id/responder", authenticate, requireStaff, responderConsulta);

export default router;
