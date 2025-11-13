/**
 * Módulo de estadísticas / dashboards.
 * Expone rutas de solo lectura agrupadas bajo /api/stats.
 */

import { Router } from "express";
import statsRoutes from "./routes/stats.routes.js";

const router = Router();

router.use("/stats", statsRoutes);

export default router;
