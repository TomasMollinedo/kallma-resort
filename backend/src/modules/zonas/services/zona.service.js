/**
 * Servicios de lógica de negocio para el módulo de Zonas
 * Maneja todas las operaciones CRUD y reglas de negocio
 */

import { db } from "../../../config/database.js";

/**
 * Obtener todas las zonas con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @param {boolean} filters.esta_activa - Filtrar por estado activo/inactivo
 * @returns {Promise<Array>} Lista de zonas
 */
export const obtenerZonas = async (filters = {}) => {
  try {
    let query = `
      SELECT 
        id_zona,
        nom_zona,
        capacidad_cabanas,
        esta_activa
      FROM zonas
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filtrar por estado activo (por defecto solo activas)
    if (filters.esta_activa !== undefined) {
      query += ` AND esta_activa = $${paramCount}`;
      params.push(filters.esta_activa);
      paramCount++;
    } else {
      // Por defecto solo mostrar zonas activas
      query += ` AND esta_activa = TRUE`;
    }

    query += ` ORDER BY nom_zona ASC`;

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error en obtenerZonas:", error);
    throw new Error("Error al obtener la lista de zonas");
  }
};

/**
 * Obtener una zona por su ID
 * @param {number} idZona - ID de la zona
 * @returns {Promise<Object>} Datos de la zona
 */
export const obtenerZonaPorId = async (idZona) => {
  try {
    const query = `
      SELECT 
        z.id_zona,
        z.nom_zona,
        z.capacidad_cabanas,
        z.esta_activa,
        COUNT(c.id_cabana) as total_cabanas
      FROM zonas z
      LEFT JOIN cabana c ON z.id_zona = c.id_zona AND c.esta_activo = TRUE
      WHERE z.id_zona = $1
      GROUP BY z.id_zona, z.nom_zona, z.capacidad_cabanas, z.esta_activa
    `;

    const result = await db.query(query, [idZona]);

    if (result.rows.length === 0) {
      throw new Error("ZONA_NOT_FOUND");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error en obtenerZonaPorId:", error);
    if (error.message === "ZONA_NOT_FOUND") {
      throw error;
    }
    throw new Error("Error al obtener la zona");
  }
};

/**
 * Crear una nueva zona
 * @param {Object} zonaData - Datos de la zona a crear
 * @param {number} idUsuario - ID del usuario que crea la zona
 * @returns {Promise<Object>} Zona creada
 */
export const crearZona = async (zonaData, idUsuario) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Verificar si ya existe una zona con el mismo nombre
    const existeZona = await client.query(
      "SELECT id_zona FROM zonas WHERE LOWER(nom_zona) = LOWER($1)",
      [zonaData.nom_zona]
    );

    if (existeZona.rows.length > 0) {
      throw new Error("ZONA_NAME_EXISTS");
    }

    // Crear la zona
    const result = await client.query(
      `INSERT INTO zonas (nom_zona, capacidad_cabanas, esta_activa)
       VALUES ($1, $2, TRUE)
       RETURNING id_zona, nom_zona, capacidad_cabanas, esta_activa`,
      [zonaData.nom_zona, zonaData.capacidad_cabanas]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en crearZona:", error);

    if (error.message === "ZONA_NAME_EXISTS") {
      throw new Error("Ya existe una zona con ese nombre");
    }

    throw new Error("Error al crear la zona");
  } finally {
    client.release();
  }
};

/**
 * Actualizar una zona existente
 * @param {number} idZona - ID de la zona a actualizar
 * @param {Object} zonaData - Datos a actualizar
 * @param {number} idUsuario - ID del usuario que actualiza
 * @returns {Promise<Object>} Zona actualizada
 */
export const actualizarZona = async (idZona, zonaData, idUsuario) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Verificar que la zona existe
    const zonaExiste = await client.query(
      "SELECT id_zona FROM zonas WHERE id_zona = $1",
      [idZona]
    );

    if (zonaExiste.rows.length === 0) {
      throw new Error("ZONA_NOT_FOUND");
    }

    // Si se está actualizando el nombre, verificar que no exista otra zona con ese nombre
    if (zonaData.nom_zona) {
      const nombreExiste = await client.query(
        "SELECT id_zona FROM zonas WHERE LOWER(nom_zona) = LOWER($1) AND id_zona != $2",
        [zonaData.nom_zona, idZona]
      );

      if (nombreExiste.rows.length > 0) {
        throw new Error("ZONA_NAME_EXISTS");
      }
    }

    // Construir query dinámico para actualizar solo los campos proporcionados
    const campos = [];
    const valores = [];
    let paramCount = 1;

    if (zonaData.nom_zona !== undefined) {
      campos.push(`nom_zona = $${paramCount}`);
      valores.push(zonaData.nom_zona);
      paramCount++;
    }

    if (zonaData.capacidad_cabanas !== undefined) {
      campos.push(`capacidad_cabanas = $${paramCount}`);
      valores.push(zonaData.capacidad_cabanas);
      paramCount++;
    }

    if (campos.length === 0) {
      throw new Error("NO_FIELDS_TO_UPDATE");
    }

    valores.push(idZona);

    const query = `
      UPDATE zonas
      SET ${campos.join(", ")}
      WHERE id_zona = $${paramCount}
      RETURNING id_zona, nom_zona, capacidad_cabanas, esta_activa
    `;

    const result = await client.query(query, valores);

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en actualizarZona:", error);

    if (error.message === "ZONA_NOT_FOUND") {
      throw new Error("La zona no existe");
    }
    if (error.message === "ZONA_NAME_EXISTS") {
      throw new Error("Ya existe otra zona con ese nombre");
    }
    if (error.message === "NO_FIELDS_TO_UPDATE") {
      throw error;
    }

    throw new Error("Error al actualizar la zona");
  } finally {
    client.release();
  }
};

/**
 * Eliminar (borrado lógico) una zona
 * @param {number} idZona - ID de la zona a eliminar
 * @param {number} idUsuario - ID del usuario que elimina
 * @returns {Promise<Object>} Zona eliminada
 */
export const eliminarZona = async (idZona, idUsuario) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Verificar que la zona existe y está activa
    const zonaExiste = await client.query(
      "SELECT id_zona, esta_activa FROM zonas WHERE id_zona = $1",
      [idZona]
    );

    if (zonaExiste.rows.length === 0) {
      throw new Error("ZONA_NOT_FOUND");
    }

    if (!zonaExiste.rows[0].esta_activa) {
      throw new Error("ZONA_ALREADY_DELETED");
    }

    // Verificar si hay cabañas activas en esta zona
    const cabanasActivas = await client.query(
      "SELECT COUNT(*) as total FROM cabana WHERE id_zona = $1 AND esta_activo = TRUE",
      [idZona]
    );

    if (parseInt(cabanasActivas.rows[0].total) > 0) {
      throw new Error("ZONA_HAS_ACTIVE_CABANAS");
    }

    // Realizar borrado lógico
    const result = await client.query(
      `UPDATE zonas
       SET esta_activa = FALSE
       WHERE id_zona = $1
       RETURNING id_zona, nom_zona, capacidad_cabanas, esta_activa`,
      [idZona]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en eliminarZona:", error);

    if (error.message === "ZONA_NOT_FOUND") {
      throw new Error("La zona no existe");
    }
    if (error.message === "ZONA_ALREADY_DELETED") {
      throw new Error("La zona ya está eliminada");
    }
    if (error.message === "ZONA_HAS_ACTIVE_CABANAS") {
      throw new Error(
        "No se puede eliminar la zona porque tiene cabañas activas asociadas"
      );
    }

    throw new Error("Error al eliminar la zona");
  } finally {
    client.release();
  }
};

/**
 * Restaurar una zona eliminada
 * @param {number} idZona - ID de la zona a restaurar
 * @param {number} idUsuario - ID del usuario que restaura
 * @returns {Promise<Object>} Zona restaurada
 */
export const restaurarZona = async (idZona, idUsuario) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Verificar que la zona existe y está inactiva
    const zonaExiste = await client.query(
      "SELECT id_zona, esta_activa FROM zonas WHERE id_zona = $1",
      [idZona]
    );

    if (zonaExiste.rows.length === 0) {
      throw new Error("ZONA_NOT_FOUND");
    }

    if (zonaExiste.rows[0].esta_activa) {
      throw new Error("ZONA_ALREADY_ACTIVE");
    }

    // Restaurar la zona
    const result = await client.query(
      `UPDATE zonas
       SET esta_activa = TRUE
       WHERE id_zona = $1
       RETURNING id_zona, nom_zona, capacidad_cabanas, esta_activa`,
      [idZona]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en restaurarZona:", error);

    if (error.message === "ZONA_NOT_FOUND") {
      throw new Error("La zona no existe");
    }
    if (error.message === "ZONA_ALREADY_ACTIVE") {
      throw new Error("La zona ya está activa");
    }

    throw new Error("Error al restaurar la zona");
  } finally {
    client.release();
  }
};
