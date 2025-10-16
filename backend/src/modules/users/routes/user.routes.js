import { Router } from "express";
import { getMyProfile, getAllUsers, createUser, updateUser, deleteUser } from "../controllers/user.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Obtener perfil del usuario autenticado
 * @access  Privado (Cualquier rol autenticado)
 */
router.get("/me", authenticate, getMyProfile);

/**
 * @route   GET /api/users
 * @desc    Listar todos los usuarios (con filtros opcionales)
 * @access  Privado (Solo Administradores)
 */
router.get("/", authenticate, requireAdmin, getAllUsers);

/**
 * @route   POST /api/users
 * @desc    Crear un nuevo usuario
 * @access  Privado (Solo Administradores)
 */
router.post("/", authenticate, requireAdmin, createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar datos de un usuario
 * @access  Privado (Solo Administradores)
 */
router.put("/:id", authenticate, requireAdmin, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Desactivar un usuario (borrado lógico)
 * @access  Privado (Solo Administradores)
 */
router.delete("/:id", authenticate, requireAdmin, deleteUser);

export default router;
