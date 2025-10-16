import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar un nuevo usuario (rol Cliente por defecto)
 * @access  Público
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuario y obtener token JWT
 * @access  Público
 */
router.post("/login", login);

export default router;
