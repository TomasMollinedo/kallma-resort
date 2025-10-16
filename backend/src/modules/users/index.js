import { Router } from "express";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

/**
 * Módulo de Usuarios y Autenticación
 * Exporta todas las rutas del módulo
 */

const router = Router();

// Montar rutas del módulo
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;
