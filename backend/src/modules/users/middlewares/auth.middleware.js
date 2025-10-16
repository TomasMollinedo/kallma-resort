import jwt from "jsonwebtoken";
import { config } from "../../../config/index.js";
import { db } from "../../../config/database.js";

/**
 * Middleware para verificar que el usuario esté autenticado
 * Extrae el token del header Authorization y lo valida
 * Adjunta la información del usuario decodificada a req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        error: "Token no proporcionado. Formato esperado: 'Bearer <token>'",
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Verificar que el usuario aún existe y está activo
    const userResult = await db.query(
      `SELECT u.id_usuario, u.email, u.nombre, u.esta_activo, r.nom_rol
       FROM usuario u
       INNER JOIN rol_usuario r ON u.id_rol_usuario = r.id_rol_usuario
       WHERE u.id_usuario = $1`,
      [decoded.id_usuario]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        ok: false,
        error: "Usuario no encontrado",
      });
    }

    const user = userResult.rows[0];

    if (!user.esta_activo) {
      return res.status(403).json({
        ok: false,
        error: "Usuario inactivo. Contacte al administrador.",
      });
    }

    // Adjuntar información del usuario al request
    req.user = {
      id_usuario: user.id_usuario,
      email: user.email,
      nombre: user.nombre,
      nom_rol: user.nom_rol,
      esta_activo: user.esta_activo,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        ok: false,
        error: "Token expirado. Por favor, inicie sesión nuevamente.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        ok: false,
        error: "Token inválido",
      });
    }

    console.error("Error en authenticate middleware:", error);
    return res.status(500).json({
      ok: false,
      error: "Error al verificar autenticación",
    });
  }
};

/**
 * Middleware para verificar que el usuario tenga uno de los roles permitidos
 * Debe usarse DESPUÉS del middleware authenticate
 * 
 * Uso: authorize(['Administrador', 'Operador'])
 */
export const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    // Verificar que el middleware authenticate se haya ejecutado antes
    if (!req.user) {
      return res.status(500).json({
        ok: false,
        error: "Error de configuración: middleware authenticate debe ejecutarse antes de authorize",
      });
    }

    // Verificar que el rol del usuario esté en la lista de roles permitidos
    if (!rolesPermitidos.includes(req.user.nom_rol)) {
      return res.status(403).json({
        ok: false,
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(", ")}`,
        rolActual: req.user.nom_rol,
      });
    }

    next();
  };
};

/**
 * Middleware específico para solo Administradores
 */
export const requireAdmin = authorize("Administrador");

/**
 * Middleware para Administradores u Operadores
 */
export const requireStaff = authorize("Administrador", "Operador");

/**
 * Middleware para cualquier usuario autenticado (Cliente, Operador, Administrador)
 */
export const requireAuth = authenticate;
