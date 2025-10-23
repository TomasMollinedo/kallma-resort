/**
 * Módulo de Reservas
 * Exporta las rutas del módulo para ser montadas en la aplicación principal
 */

import { Router } from "express";
import reservaRoutes from "./routes/reserva.routes.js";

const router = Router();

// Montar rutas de reservas
router.use("/reservas", reservaRoutes);

export default router;
