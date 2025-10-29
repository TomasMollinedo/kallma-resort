/**
 * Servicios de lógica de negocio para el módulo de Servicios
 * Maneja todas las operaciones CRUD y reglas de negocio
 */

import { pool } from "../../../config/database.js";

/**
 * Obtener todos los servicios
 * Este endpoint es PÚBLICO para permitir el flujo del cliente sin autenticación
 * @returns {Promise<Array>} Lista de servicios
 */
export const obtenerServicios = async () => {
  try {
    const query = `
      SELECT 
        id_servicio,
        nom_servicio,
        precio_servicio
      FROM servicios
      ORDER BY nom_servicio ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error en obtenerServicios:", error);
    throw new Error("Error al obtener la lista de servicios");
  }
};

/**
 * Obtener un servicio por su ID
 * @param {number} idServicio - ID del servicio
 * @returns {Promise<Object>} Datos del servicio
 */
export const obtenerServicioPorId = async (idServicio) => {
  try {
    const query = `
      SELECT 
        s.id_servicio,
        s.nom_servicio,
        s.precio_servicio,
        COUNT(DISTINCT sr.id_reserva) as total_reservas
      FROM servicios s
      LEFT JOIN servicio_reserva sr ON s.id_servicio = sr.id_servicio
      WHERE s.id_servicio = $1
      GROUP BY s.id_servicio, s.nom_servicio, s.precio_servicio
    `;

    const result = await pool.query(query, [idServicio]);

    if (result.rows.length === 0) {
      throw new Error("SERVICIO_NOT_FOUND");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error en obtenerServicioPorId:", error);
    if (error.message === "SERVICIO_NOT_FOUND") {
      throw error;
    }
    throw new Error("Error al obtener el servicio");
  }
};

/**
 * Crear un nuevo servicio
 * @param {Object} servicioData - Datos del servicio a crear
 * @returns {Promise<Object>} Servicio creado
 */
export const crearServicio = async (servicioData) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar si ya existe un servicio con el mismo nombre
    const existeServicio = await client.query(
      "SELECT id_servicio FROM servicios WHERE LOWER(nom_servicio) = LOWER($1)",
      [servicioData.nom_servicio]
    );

    if (existeServicio.rows.length > 0) {
      throw new Error("SERVICIO_NAME_EXISTS");
    }

    // Crear el servicio
    const result = await client.query(
      `INSERT INTO servicios (nom_servicio, precio_servicio)
       VALUES ($1, $2)
       RETURNING id_servicio, nom_servicio, precio_servicio`,
      [servicioData.nom_servicio, servicioData.precio_servicio]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en crearServicio:", error);

    if (error.message === "SERVICIO_NAME_EXISTS") {
      throw new Error("Ya existe un servicio con ese nombre");
    }

    throw new Error("Error al crear el servicio");
  } finally {
    client.release();
  }
};

/**
 * Actualizar un servicio existente
 * @param {number} idServicio - ID del servicio a actualizar
 * @param {Object} servicioData - Datos a actualizar
 * @returns {Promise<Object>} Servicio actualizado
 */
export const actualizarServicio = async (idServicio, servicioData) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar que el servicio existe
    const servicioExiste = await client.query(
      "SELECT id_servicio FROM servicios WHERE id_servicio = $1",
      [idServicio]
    );

    if (servicioExiste.rows.length === 0) {
      throw new Error("SERVICIO_NOT_FOUND");
    }

    // Si se está actualizando el nombre, verificar que no exista otro servicio con ese nombre
    if (servicioData.nom_servicio) {
      const nombreExiste = await client.query(
        "SELECT id_servicio FROM servicios WHERE LOWER(nom_servicio) = LOWER($1) AND id_servicio != $2",
        [servicioData.nom_servicio, idServicio]
      );

      if (nombreExiste.rows.length > 0) {
        throw new Error("SERVICIO_NAME_EXISTS");
      }
    }

    // Construir query dinámico para actualizar solo los campos proporcionados
    const campos = [];
    const valores = [];
    let paramCount = 1;

    if (servicioData.nom_servicio !== undefined) {
      campos.push(`nom_servicio = $${paramCount}`);
      valores.push(servicioData.nom_servicio);
      paramCount++;
    }

    if (servicioData.precio_servicio !== undefined) {
      campos.push(`precio_servicio = $${paramCount}`);
      valores.push(servicioData.precio_servicio);
      paramCount++;
    }

    if (campos.length === 0) {
      throw new Error("NO_FIELDS_TO_UPDATE");
    }

    valores.push(idServicio);

    const query = `
      UPDATE servicios
      SET ${campos.join(", ")}
      WHERE id_servicio = $${paramCount}
      RETURNING id_servicio, nom_servicio, precio_servicio
    `;

    const result = await client.query(query, valores);

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en actualizarServicio:", error);

    if (error.message === "SERVICIO_NOT_FOUND") {
      throw new Error("El servicio no existe");
    }
    if (error.message === "SERVICIO_NAME_EXISTS") {
      throw new Error("Ya existe otro servicio con ese nombre");
    }
    if (error.message === "NO_FIELDS_TO_UPDATE") {
      throw error;
    }

    throw new Error("Error al actualizar el servicio");
  } finally {
    client.release();
  }
};

/**
 * Eliminar un servicio (eliminación física)
 * Solo si no tiene reservas asociadas
 * @param {number} idServicio - ID del servicio a eliminar
 * @returns {Promise<Object>} Servicio eliminado
 */
export const eliminarServicio = async (idServicio) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar que el servicio existe
    const servicioExiste = await client.query(
      "SELECT id_servicio, nom_servicio FROM servicios WHERE id_servicio = $1",
      [idServicio]
    );

    if (servicioExiste.rows.length === 0) {
      throw new Error("SERVICIO_NOT_FOUND");
    }

    // Verificar si hay reservas asociadas
    const reservasAsociadas = await client.query(
      "SELECT COUNT(*) as total FROM servicio_reserva WHERE id_servicio = $1",
      [idServicio]
    );

    if (parseInt(reservasAsociadas.rows[0].total) > 0) {
      throw new Error("SERVICIO_HAS_RESERVAS");
    }

    // Realizar eliminación física
    const result = await client.query(
      `DELETE FROM servicios
       WHERE id_servicio = $1
       RETURNING id_servicio, nom_servicio, precio_servicio`,
      [idServicio]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en eliminarServicio:", error);

    if (error.message === "SERVICIO_NOT_FOUND") {
      throw new Error("El servicio no existe");
    }
    if (error.message === "SERVICIO_HAS_RESERVAS") {
      throw new Error(
        "No se puede eliminar el servicio porque tiene reservas asociadas"
      );
    }

    throw new Error("Error al eliminar el servicio");
  } finally {
    client.release();
  }
};
