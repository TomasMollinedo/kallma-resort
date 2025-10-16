import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../../config/database.js";
import { config } from "../../../config/index.js";

/**
 * Servicio de Autenticación
 * Contiene la lógica de negocio para registro y login
 */

/**
 * Genera un token JWT para un usuario
 */
const generateToken = (user) => {
  const payload = {
    id_usuario: user.id_usuario,
    email: user.email,
    nom_rol: user.nom_rol,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Registra un nuevo usuario con rol "Cliente" por defecto
 */
export const registerUser = async (userData) => {
  const { email, password, nombre, telefono, dni } = userData;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar si el email ya existe
    const existingUser = await client.query(
      "SELECT id_usuario FROM usuario WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    // Obtener el ID del rol "Cliente"
    const roleResult = await client.query(
      "SELECT id_rol_usuario FROM rol_usuario WHERE nom_rol = $1",
      ["Cliente"]
    );

    if (roleResult.rows.length === 0) {
      throw new Error("ROLE_NOT_FOUND");
    }

    const clienteRolId = roleResult.rows[0].id_rol_usuario;

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario
    const insertResult = await client.query(
      `INSERT INTO usuario 
       (email, password, nombre, telefono, dni, id_rol_usuario, esta_activo, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW())
       RETURNING id_usuario, email, nombre, telefono, dni, esta_activo`,
      [email.toLowerCase(), hashedPassword, nombre, telefono || null, dni || null, clienteRolId]
    );

    await client.query("COMMIT");
    client.release();

    const newUser = insertResult.rows[0];

    // Generar token JWT
    const token = generateToken({
      id_usuario: newUser.id_usuario,
      email: newUser.email,
      nom_rol: "Cliente",
    });

    return {
      user: {
        id_usuario: newUser.id_usuario,
        email: newUser.email,
        nombre: newUser.nombre,
        telefono: newUser.telefono,
        dni: newUser.dni,
        rol: "Cliente",
        esta_activo: newUser.esta_activo,
      },
      token,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    client.release();
    throw error;
  }
};

/**
 * Autentica un usuario y devuelve un JWT
 */
export const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // Buscar usuario por email
  const userResult = await pool.query(
    `SELECT u.id_usuario, u.email, u.password, u.nombre, u.telefono, u.dni, 
            u.esta_activo, r.nom_rol
     FROM usuario u
     INNER JOIN rol_usuario r ON u.id_rol_usuario = r.id_rol_usuario
     WHERE u.email = $1`,
    [email.toLowerCase()]
  );

  if (userResult.rows.length === 0) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const user = userResult.rows[0];

  // Verificar si el usuario está activo
  if (!user.esta_activo) {
    throw new Error("USER_INACTIVE");
  }

  // Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Generar token JWT
  const token = generateToken({
    id_usuario: user.id_usuario,
    email: user.email,
    nom_rol: user.nom_rol,
  });

  return {
    user: {
      id_usuario: user.id_usuario,
      email: user.email,
      nombre: user.nombre,
      telefono: user.telefono,
      dni: user.dni,
      rol: user.nom_rol,
      esta_activo: user.esta_activo,
    },
    token,
  };
};
