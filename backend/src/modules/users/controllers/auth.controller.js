import { config } from "../../../config/index.js";
import * as authService from "../services/auth.service.js";
import { validateRegisterData, validateLoginData } from "../schemas/auth.schemas.js";

/**
 * Controlador de Autenticación
 * Maneja las peticiones HTTP y delega la lógica de negocio a los servicios
 */

/**
 * POST /api/auth/register
 * Registrar un nuevo usuario
 */
export const register = async (req, res) => {
  try {
    // Validar datos de entrada
    const validation = validateRegisterData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        error: "Datos de entrada inválidos",
        errors: validation.errors,
      });
    }

    // Llamar al servicio
    const result = await authService.registerUser(req.body);

    res.status(201).json({
      ok: true,
      message: "Usuario registrado exitosamente",
      data: result,
    });
  } catch (error) {
    console.error("Error en register controller:", error);

    // Manejar errores de negocio
    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        ok: false,
        error: "El email ya está registrado",
      });
    }

    if (error.message === "ROLE_NOT_FOUND") {
      return res.status(500).json({
        ok: false,
        error: "Error al obtener rol de Cliente. Verifica la configuración de la base de datos.",
      });
    }

    // Error genérico
    res.status(500).json({
      ok: false,
      error: "Error al registrar usuario",
      details: config.env === "development" ? error.message : undefined,
    });
  }
};

/**
 * POST /api/auth/login
 * Autenticar usuario
 */
export const login = async (req, res) => {
  try {
    // Validar datos de entrada
    const validation = validateLoginData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        error: "Datos de entrada inválidos",
        errors: validation.errors,
      });
    }

    // Llamar al servicio
    const result = await authService.loginUser(req.body);

    res.json({
      ok: true,
      message: "Login exitoso",
      data: result,
    });
  } catch (error) {
    console.error("Error en login controller:", error);

    // Manejar errores de negocio
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        ok: false,
        error: "Credenciales inválidas",
      });
    }

    if (error.message === "USER_INACTIVE") {
      return res.status(403).json({
        ok: false,
        error: "Usuario inactivo. Contacte al administrador.",
      });
    }

    // Error genérico
    res.status(500).json({
      ok: false,
      error: "Error al iniciar sesión",
      details: config.env === "development" ? error.message : undefined,
    });
  }
};
