/**
 * Módulo de Zonas
 * Punto de entrada del módulo que exporta las rutas
 */

import { Router } from "express";
import zonaRoutes from "./routes/zona.routes.js";

const router = Router();

// Montar rutas de zonas en /api/zonas
router.use("/zonas", zonaRoutes);

export default router;
