import bcrypt from "bcryptjs";
import { pool } from "../../../config/database.js";

/**
 * Servicio de Usuarios
 * Contiene la lógica de negocio para gestión de usuarios
 */

/**
 * Obtiene un usuario por su ID con información del rol
 */
export const getUserById = async (userId) => {
  const result = await pool.query(
    `SELECT u.id_usuario, u.email, u.nombre, u.telefono, u.dni, 
            u.esta_activo, u.fecha_creacion, r.nom_rol
     FROM usuario u
     INNER JOIN rol_usuario r ON u.id_rol_usuario = r.id_rol_usuario
     WHERE u.id_usuario = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("USER_NOT_FOUND");
  }

  const user = result.rows[0];

  return {
    id_usuario: user.id_usuario,
    email: user.email,
    nombre: user.nombre,
    telefono: user.telefono,
    dni: user.dni,
    rol: user.nom_rol,
    esta_activo: user.esta_activo,
    fecha_creacion: user.fecha_creacion,
  };
};

/**
 * Lista todos los usuarios con filtros opcionales
 */
export const getAllUsers = async (filters = {}) => {
  const { rol, esta_activo, limit = 100, offset = 0 } = filters;

  let query = `
    SELECT u.id_usuario, u.email, u.nombre, u.telefono, u.dni, 
           u.esta_activo, u.fecha_creacion, r.nom_rol
    FROM usuario u
    INNER JOIN rol_usuario r ON u.id_rol_usuario = r.id_rol_usuario
    WHERE 1=1
  `;

  const params = [];
  let paramCount = 1;

  if (rol) {
    query += ` AND r.nom_rol = $${paramCount}`;
    params.push(rol);
    paramCount++;
  }

  if (esta_activo !== undefined) {
    query += ` AND u.esta_activo = $${paramCount}`;
    params.push(esta_activo === "true" || esta_activo === true);
    paramCount++;
  }

  query += ` ORDER BY u.fecha_creacion DESC`;
  query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  // Contar total
  let countQuery = `
    SELECT COUNT(*) as total
    FROM usuario u
    INNER JOIN rol_usuario r ON u.id_rol_usuario = r.id_rol_usuario
    WHERE 1=1
  `;

  const countParams = [];
  let countParamCount = 1;

  if (rol) {
    countQuery += ` AND r.nom_rol = $${countParamCount}`;
    countParams.push(rol);
    countParamCount++;
  }

  if (esta_activo !== undefined) {
    countQuery += ` AND u.esta_activo = $${countParamCount}`;
    countParams.push(esta_activo === "true" || esta_activo === true);
  }

  const countResult = await pool.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].total);

  return {
    users: result.rows.map(user => ({
      id_usuario: user.id_usuario,
      email: user.email,
      nombre: user.nombre,
      telefono: user.telefono,
      dni: user.dni,
      rol: user.nom_rol,
      esta_activo: user.esta_activo,
      fecha_creacion: user.fecha_creacion,
    })),
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: parseInt(offset) + parseInt(limit) < total,
    },
  };
};

/**
 * Actualiza un usuario
 */
export const updateUser = async (userId, updateData, modifiedBy) => {
  const { nombre, telefono, dni, email, password, id_rol_usuario, esta_activo } = updateData;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar que el usuario existe
    const existingUser = await client.query(
      "SELECT id_usuario FROM usuario WHERE id_usuario = $1",
      [userId]
    );

    if (existingUser.rows.length === 0) {
      throw new Error("USER_NOT_FOUND");
    }

    // Si se actualiza email, verificar que no exista
    if (email) {
      const emailCheck = await client.query(
        "SELECT id_usuario FROM usuario WHERE email = $1 AND id_usuario != $2",
        [email.toLowerCase(), userId]
      );

      if (emailCheck.rows.length > 0) {
        throw new Error("EMAIL_ALREADY_EXISTS");
      }
    }

    // Si se actualiza rol, verificar que existe
    if (id_rol_usuario) {
      const roleCheck = await client.query(
        "SELECT id_rol_usuario FROM rol_usuario WHERE id_rol_usuario = $1",
        [id_rol_usuario]
      );

      if (roleCheck.rows.length === 0) {
        throw new Error("ROLE_NOT_FOUND");
      }
    }

    // Construir query dinámica
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (nombre !== undefined) {
      updates.push(`nombre = $${paramCount}`);
      values.push(nombre);
      paramCount++;
    }

    if (telefono !== undefined) {
      updates.push(`telefono = $${paramCount}`);
      values.push(telefono || null);
      paramCount++;
    }

    if (dni !== undefined) {
      updates.push(`dni = $${paramCount}`);
      values.push(dni || null);
      paramCount++;
    }

    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(email.toLowerCase());
      paramCount++;
    }

    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (id_rol_usuario !== undefined) {
      updates.push(`id_rol_usuario = $${paramCount}`);
      values.push(id_rol_usuario);
      paramCount++;
    }

    if (esta_activo !== undefined) {
      updates.push(`esta_activo = $${paramCount}`);
      values.push(esta_activo);
      paramCount++;
    }

    if (updates.length === 0) {
      throw new Error("NO_FIELDS_TO_UPDATE");
    }

    // Auditoría
    updates.push(`id_usuario_modific = $${paramCount}`);
    values.push(modifiedBy);
    paramCount++;

    updates.push(`fecha_modific = $${paramCount}`);
    values.push(new Date());
    paramCount++;

    values.push(userId);

    const updateQuery = `
      UPDATE usuario
      SET ${updates.join(", ")}
      WHERE id_usuario = $${paramCount}
      RETURNING id_usuario, email, nombre, telefono, dni, esta_activo, id_rol_usuario
    `;

    const updateResult = await client.query(updateQuery, values);
    const updatedUser = updateResult.rows[0];

    // Obtener nombre del rol
    const roleResult = await client.query(
      "SELECT nom_rol FROM rol_usuario WHERE id_rol_usuario = $1",
      [updatedUser.id_rol_usuario]
    );

    await client.query("COMMIT");
    client.release();

    return {
      id_usuario: updatedUser.id_usuario,
      email: updatedUser.email,
      nombre: updatedUser.nombre,
      telefono: updatedUser.telefono,
      dni: updatedUser.dni,
      rol: roleResult.rows[0].nom_rol,
      esta_activo: updatedUser.esta_activo,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    client.release();
    throw error;
  }
};

/**
 * Crea un nuevo usuario (solo Admin)
 */
export const createUser = async (userData, createdBy) => {
  const { email, password, nombre, telefono, dni, id_rol_usuario } = userData;
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

    // Verificar que el rol existe
    const roleCheck = await client.query(
      "SELECT id_rol_usuario FROM rol_usuario WHERE id_rol_usuario = $1",
      [id_rol_usuario]
    );

    if (roleCheck.rows.length === 0) {
      throw new Error("ROLE_NOT_FOUND");
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario
    const insertResult = await client.query(
      `INSERT INTO usuario 
       (email, password, nombre, telefono, dni, id_rol_usuario, esta_activo, fecha_creacion, id_usuario_creacion)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW(), $7)
       RETURNING id_usuario, email, nombre, telefono, dni, esta_activo, id_rol_usuario`,
      [email.toLowerCase(), hashedPassword, nombre, telefono || null, dni || null, id_rol_usuario, createdBy]
    );

    await client.query("COMMIT");
    client.release();

    const newUser = insertResult.rows[0];

    // Obtener nombre del rol
    const roleResult = await pool.query(
      "SELECT nom_rol FROM rol_usuario WHERE id_rol_usuario = $1",
      [newUser.id_rol_usuario]
    );

    return {
      id_usuario: newUser.id_usuario,
      email: newUser.email,
      nombre: newUser.nombre,
      telefono: newUser.telefono,
      dni: newUser.dni,
      rol: roleResult.rows[0].nom_rol,
      esta_activo: newUser.esta_activo,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    client.release();
    throw error;
  }
};

/**
 * Elimina un usuario (borrado lógico: esta_activo = false)
 */
export const deleteUser = async (userId, deletedBy) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar que el usuario existe
    const existingUser = await client.query(
      "SELECT id_usuario, esta_activo FROM usuario WHERE id_usuario = $1",
      [userId]
    );

    if (existingUser.rows.length === 0) {
      throw new Error("USER_NOT_FOUND");
    }

    if (!existingUser.rows[0].esta_activo) {
      throw new Error("USER_ALREADY_INACTIVE");
    }

    // Borrado lógico
    await client.query(
      `UPDATE usuario 
       SET esta_activo = FALSE, 
           id_usuario_modific = $1, 
           fecha_modific = NOW()
       WHERE id_usuario = $2`,
      [deletedBy, userId]
    );

    await client.query("COMMIT");
    client.release();

    return { success: true };
  } catch (error) {
    await client.query("ROLLBACK");
    client.release();
    throw error;
  }
};
