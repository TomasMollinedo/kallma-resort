import { config } from "../../../config/index.js";
import * as userService from "../services/user.service.js";
import { validateCreateUserData, validateUpdateUserData, validateUserFilters } from "../schemas/user.schemas.js";

/**
 * Controlador de Usuarios
 * Maneja las peticiones HTTP y delega la lógica de negocio a los servicios
 */

/**
 * GET /api/users/me
 * Obtener perfil del usuario autenticado
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const user = await userService.getUserById(userId);

    res.json({
      ok: true,
      data: user,
    });
  } catch (error) {
    console.error("Error en getMyProfile controller:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        error: "Usuario no encontrado",
      });
    }

    res.status(500).json({
      ok: false,
      error: "Error al obtener perfil de usuario",
      details: config.env === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /api/users/:id
 * Obtener detalles de un usuario específico (solo Admin)
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        ok: false,
        error: "ID de usuario inválido",
      });
    }

    const user = await userService.getUserById(parseInt(id));

    res.json({
      ok: true,
      data: user,
    });
  } catch (error) {
    console.error("Error en getUserById controller:", error);

    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        error: "Usuario no encontrado",
      });
    }

    res.status(500).json({
      ok: false,
      error: "Error al obtener el usuario",
      details: config.env === "development" ? error.message : undefined,
    });
  }
};

/**
 * GET /api/users
 * Listar todos los usuarios (solo Admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    // Validar filtros
    const validation = validateUserFilters(req.query);
    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        error: "Filtros inválidos",
        errors: validation.errors,
      });
    }

    const result = await userService.getAllUsers(req.query);

    res.json({
      ok: true,
      data: result.users,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error en getAllUsers controller:", error);

    res.status(500).json({
      ok: false,
      error: "Error al obtener usuarios",
      details: config.env === "development" ? error.message : undefined,
    });
  }
};

/**
 * PATCH /api/users/:id
 * Actualizar usuario (solo Admin)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar datos de entrada
    const validation = validateUpdateUserData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        error: "Datos de entrada inválidos",
        errors: validation.errors,
      });
    }

    const updatedUser = await userService.updateUser(
      id,
      req.body,
      req.user.id_usuario
    );

    res.json({
      ok: true,
      message: "Usuario actualizado exitosamente",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error en updateUser controller:", error);

    // Manejar errores de negocio
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        error: "Usuario no encontrado",
      });
    }

    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        ok: false,
        error: "El email ya está en uso por otro usuario",
      });
    }

    if (error.message === "ROLE_NOT_FOUND") {
      return res.status(400).json({
        ok: false,
        error: "El rol especificado no existe",
      });
    }

    if (error.message === "NO_FIELDS_TO_UPDATE") {
      return res.status(400).json({
        ok: false,
        error: "No se proporcionaron campos para actualizar",
      });
    }

    // Error genérico
    res.status(500).json({
      ok: false,
      error: "Error al actualizar usuario",
      details: config.env === "development" ? error.message : undefined,
    });
  }
};

/**
 * POST /api/users
 * Crear un nuevo usuario (solo Admin)
 */
export const createUser = async (req, res) => {
  try {
    // Validar datos de entrada
    const validation = validateCreateUserData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        error: "Datos de entrada inválidos",
        errors: validation.errors,
      });
    }

    const newUser = await userService.createUser(
      req.body,
      req.user.id_usuario
    );

    res.status(201).json({
      ok: true,
      message: "Usuario creado exitosamente",
      data: newUser,
    });
  } catch (error) {
    console.error("Error en createUser controller:", error);

    // Manejar errores de negocio
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        ok: false,
        error: "El email ya está registrado",
      });
    }

    if (error.message === "ROLE_NOT_FOUND") {
      return res.status(400).json({
        ok: false,
        error: "El rol especificado no existe",
      });
    }

    // Error genérico
    res.status(500).json({
      ok: false,
      error: "Error al crear usuario",
      details: config.env === "development" ? error.message : undefined,
    });
  }
};

/**
 * DELETE /api/users/:id
 * Eliminar usuario (borrado lógico, solo Admin)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await userService.deleteUser(id, req.user.id_usuario);

    res.json({
      ok: true,
      message: "Usuario desactivado exitosamente",
    });
  } catch (error) {
    console.error("Error en deleteUser controller:", error);

    // Manejar errores de negocio
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        ok: false,
        error: "Usuario no encontrado",
      });
    }

    if (error.message === "USER_ALREADY_INACTIVE") {
      return res.status(400).json({
        ok: false,
        error: "El usuario ya está inactivo",
      });
    }

    if (error.message.startsWith("USER_HAS_ACTIVE_RESERVATIONS:")) {
      const count = error.message.split(":")[1];
      return res.status(400).json({
        ok: false,
        error: `No se puede desactivar el usuario porque tiene ${count} reserva${count > 1 ? 's' : ''} activa${count > 1 ? 's' : ''} o futura${count > 1 ? 's' : ''}`,
      });
    }

    // Error genérico
    res.status(500).json({
      ok: false,
      error: "Error al desactivar usuario",
      details: config.env === "development" ? error.message : undefined,
    });
  }
};
