/**
 * Módulo de Consultas
 * Exporta las rutas del módulo para ser montadas en la aplicación principal
 */

import { Router } from "express";
import consultaRoutes from "./routes/consulta.routes.js";

const router = Router();

// Montar rutas de consultas
router.use("/consultas", consultaRoutes);

export default router;
