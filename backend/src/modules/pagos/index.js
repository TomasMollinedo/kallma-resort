/**
 * Módulo de Pagos
 * Exporta las rutas del módulo para ser montadas en la aplicación principal
 */

import { Router } from "express";
import pagoRoutes from "./routes/pago.routes.js";

const router = Router();

// Montar rutas de pagos
router.use("/pagos", pagoRoutes);

export default router;
