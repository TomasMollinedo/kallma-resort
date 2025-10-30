import { Router } from "express";
import { getMyProfile, getUserById, getAllUsers, createUser, updateUser, deleteUser } from "../controllers/user.controller.js";
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
 * @desc    Listar todos los usuarios (con filtros y búsqueda)
 * @query   nombre, email, dni, rol, esta_activo, limit, offset
 * @access  Privado (Solo Administradores)
 */
router.get("/", authenticate, requireAdmin, getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener detalles de un usuario específico
 * @access  Privado (Solo Administradores)
 */
router.get("/:id", authenticate, requireAdmin, getUserById);

/**
 * @route   POST /api/users
 * @desc    Crear un nuevo usuario
 * @access  Privado (Solo Administradores)
 */
router.post("/", authenticate, requireAdmin, createUser);

/**
 * @route   PATCH /api/users/:id
 * @desc    Actualizar datos de un usuario (actualización parcial)
 * @access  Privado (Solo Administradores)
 */
router.patch("/:id", authenticate, requireAdmin, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Desactivar un usuario (borrado lógico)
 * @access  Privado (Solo Administradores)
 */
router.delete("/:id", authenticate, requireAdmin, deleteUser);

export default router;
