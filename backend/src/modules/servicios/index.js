/**
 * Módulo de Servicios
 * Punto de entrada del módulo que exporta las rutas
 */

import { Router } from "express";
import servicioRoutes from "./routes/servicio.routes.js";

const router = Router();

// Montar rutas de servicios en /api/servicios
router.use("/servicios", servicioRoutes);

export default router;
