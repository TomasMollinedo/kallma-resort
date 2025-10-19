/**
 * Módulo de Cabañas
 * Punto de entrada del módulo que exporta las rutas
 */

import { Router } from "express";
import cabanaRoutes from "./routes/cabana.routes.js";

const router = Router();

// Montar rutas de cabañas en /api/cabanas
router.use("/cabanas", cabanaRoutes);

export default router;
