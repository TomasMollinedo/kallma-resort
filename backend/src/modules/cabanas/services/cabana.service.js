/**
 * Servicios de lógica de negocio para el módulo de Cabañas
 * Maneja todas las operaciones CRUD y reglas de negocio
 */

import { pool } from "../../../config/database.js";

/**
 * Obtener todas las cabañas con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} Lista de cabañas
 */
export const obtenerCabanas = async (filters = {}) => {
  try {
    let query = `
      SELECT 
        c.id_cabana,
        c.cod_cabana,
        c.id_tipo_cab,
        tc.nom_tipo_cab,
        tc.capacidad,
        tc.precio_noche,
        c.id_zona,
        z.nom_zona,
        c.esta_activo,
        c.en_mantenimiento,
        c.fecha_creacion,
        c.fecha_modific,
        uc.nombre as usuario_creacion,
        um.nombre as usuario_modificacion,
        -- Verificar si está reservada HOY
        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM cabanas_reserva cr
            INNER JOIN reserva r ON cr.id_reserva = r.id_reserva
            INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
            WHERE cr.id_cabana = c.id_cabana
              AND r.check_in <= CURRENT_DATE
              AND r.check_out >= CURRENT_DATE
              AND eo.nom_estado NOT IN ('Cancelada')
          ) THEN TRUE
          ELSE FALSE
        END as reservada_hoy
      FROM cabana c
      INNER JOIN tipo_cabana tc ON c.id_tipo_cab = tc.id_tipo_cab
      INNER JOIN zonas z ON c.id_zona = z.id_zona
      INNER JOIN usuario uc ON c.id_usuario_creacion = uc.id_usuario
      LEFT JOIN usuario um ON c.id_usuario_modific = um.id_usuario
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filtrar por código de cabaña
    if (filters.cod_cabana) {
      query += ` AND c.cod_cabana ILIKE $${paramCount}`;
      params.push(`%${filters.cod_cabana}%`);
      paramCount++;
    }

    // Filtrar por zona
    if (filters.id_zona) {
      query += ` AND c.id_zona = $${paramCount}`;
      params.push(filters.id_zona);
      paramCount++;
    }

    // Filtrar por estado activo
    if (filters.esta_activo !== undefined) {
      query += ` AND c.esta_activo = $${paramCount}`;
      params.push(filters.esta_activo);
      paramCount++;
    }

    // Filtrar por mantenimiento
    if (filters.en_mantenimiento !== undefined) {
      query += ` AND c.en_mantenimiento = $${paramCount}`;
      params.push(filters.en_mantenimiento);
      paramCount++;
    }

    query += ` ORDER BY c.cod_cabana ASC`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error en obtenerCabanas:", error);
    throw new Error("Error al obtener la lista de cabañas");
  }
};

/**
 * Obtener cabañas por zona
 * @param {number} idZona - ID de la zona
 * @returns {Promise<Array>} Lista de cabañas de la zona
 */
export const obtenerCabanasPorZona = async (idZona) => {
  try {
    const query = `
      SELECT 
        c.id_cabana,
        c.cod_cabana,
        c.id_tipo_cab,
        tc.nom_tipo_cab,
        tc.capacidad,
        tc.precio_noche,
        c.id_zona,
        z.nom_zona,
        c.esta_activo,
        c.en_mantenimiento,
        c.fecha_creacion,
        c.fecha_modific,
        uc.nombre as usuario_creacion,
        um.nombre as usuario_modificacion,
        -- Verificar si está reservada HOY
        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM cabanas_reserva cr
            INNER JOIN reserva r ON cr.id_reserva = r.id_reserva
            INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
            WHERE cr.id_cabana = c.id_cabana
              AND r.check_in <= CURRENT_DATE
              AND r.check_out >= CURRENT_DATE
              AND eo.nom_estado NOT IN ('Cancelada')
          ) THEN TRUE
          ELSE FALSE
        END as reservada_hoy
      FROM cabana c
      INNER JOIN tipo_cabana tc ON c.id_tipo_cab = tc.id_tipo_cab
      INNER JOIN zonas z ON c.id_zona = z.id_zona
      INNER JOIN usuario uc ON c.id_usuario_creacion = uc.id_usuario
      LEFT JOIN usuario um ON c.id_usuario_modific = um.id_usuario
      WHERE c.id_zona = $1 AND c.esta_activo = TRUE
      ORDER BY c.cod_cabana ASC
    `;

    const result = await pool.query(query, [idZona]);
    return result.rows;
  } catch (error) {
    console.error("Error en obtenerCabanasPorZona:", error);
    throw new Error("Error al obtener las cabañas de la zona");
  }
};

/**
 * Obtener cabañas reservadas para una fecha específica
 * @param {string} fecha - Fecha a verificar en formato YYYY-MM-DD
 * @returns {Promise<Array>} Lista de cabañas reservadas con datos de cabana y reserva
 */
export const obtenerCabanasReservadas = async (fecha) => {
  try {
    const query = `
      SELECT DISTINCT
        c.id_cabana,
        c.cod_cabana,
        tc.nom_tipo_cab,
        z.nom_zona,
        r.cod_reserva,
        r.check_in,
        r.check_out,
        eo.nom_estado as estado_reserva
      FROM cabana c
      INNER JOIN cabanas_reserva cr ON c.id_cabana = cr.id_cabana
      INNER JOIN reserva r ON cr.id_reserva = r.id_reserva
      INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
      INNER JOIN tipo_cabana tc ON c.id_tipo_cab = tc.id_tipo_cab
      INNER JOIN zonas z ON c.id_zona = z.id_zona
      WHERE r.check_in <= $1
        AND r.check_out >= $1
        AND eo.nom_estado NOT IN ('Cancelada')
        AND c.esta_activo = TRUE
      ORDER BY c.cod_cabana ASC
    `;

    const result = await pool.query(query, [fecha]);
    return result.rows;
  } catch (error) {
    console.error("Error en obtenerCabanasReservadas:", error);
    throw new Error("Error al obtener las cabañas reservadas");
  }
};

/**
 * Obtener una cabaña por su ID
 * @param {number} idCabana - ID de la cabaña
 * @returns {Promise<Object>} Datos de la cabaña
 */
export const obtenerCabanaPorId = async (idCabana) => {
  try {
    const query = `
      SELECT 
        c.id_cabana,
        c.cod_cabana,
        c.id_tipo_cab,
        tc.nom_tipo_cab,
        tc.capacidad,
        tc.precio_noche,
        c.id_zona,
        z.nom_zona,
        c.esta_activo,
        c.en_mantenimiento,
        c.fecha_creacion,
        c.fecha_modific,
        uc.nombre as usuario_creacion,
        um.nombre as usuario_modificacion,
        -- Verificar si está reservada HOY
        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM cabanas_reserva cr
            INNER JOIN reserva r ON cr.id_reserva = r.id_reserva
            INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
            WHERE cr.id_cabana = c.id_cabana
              AND r.check_in <= CURRENT_DATE
              AND r.check_out >= CURRENT_DATE
              AND eo.nom_estado NOT IN ('Cancelada')
          ) THEN TRUE
          ELSE FALSE
        END as reservada_hoy
      FROM cabana c
      INNER JOIN tipo_cabana tc ON c.id_tipo_cab = tc.id_tipo_cab
      INNER JOIN zonas z ON c.id_zona = z.id_zona
      INNER JOIN usuario uc ON c.id_usuario_creacion = uc.id_usuario
      LEFT JOIN usuario um ON c.id_usuario_modific = um.id_usuario
      WHERE c.id_cabana = $1
    `;

    const result = await pool.query(query, [idCabana]);

    if (result.rows.length === 0) {
      throw new Error("CABANA_NOT_FOUND");
    }

    const cabana = result.rows[0];

    // Obtener las reservas vinculadas a esta cabaña
    const reservasQuery = `
      SELECT 
        r.id_reserva,
        r.cod_reserva,
        r.check_in,
        r.check_out,
        r.cant_personas,
        r.monto_total_res,
        r.monto_pagado,
        r.esta_pagada,
        eo.nom_estado as estado,
        u.nombre as nombre_cliente,
        u.email as email_cliente
      FROM cabanas_reserva cr
      INNER JOIN reserva r ON cr.id_reserva = r.id_reserva
      INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
      INNER JOIN usuario u ON r.id_usuario_creacion = u.id_usuario
      WHERE cr.id_cabana = $1
      ORDER BY r.check_in DESC
      LIMIT 10
    `;

    const reservasResult = await pool.query(reservasQuery, [idCabana]);

    // Agregar las reservas al objeto de la cabaña
    cabana.reservas = reservasResult.rows;
    cabana.total_reservas = reservasResult.rows.length;

    return cabana;
  } catch (error) {
    console.error("Error en obtenerCabanaPorId:", error);
    if (error.message === "CABANA_NOT_FOUND") {
      throw error;
    }
    throw new Error("Error al obtener la cabaña");
  }
};

/**
 * Crear una nueva cabaña
 * @param {Object} cabanaData - Datos de la cabaña a crear
 * @param {number} idUsuario - ID del usuario que crea la cabaña
 * @returns {Promise<Object>} Cabaña creada
 */
export const crearCabana = async (cabanaData, idUsuario) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar si ya existe una cabaña con el mismo código
    const existeCabana = await client.query(
      "SELECT id_cabana FROM cabana WHERE LOWER(cod_cabana) = LOWER($1)",
      [cabanaData.cod_cabana]
    );

    if (existeCabana.rows.length > 0) {
      throw new Error("CABANA_CODE_EXISTS");
    }

    // Verificar que el tipo de cabaña existe y está activo
    const tipoCabana = await client.query(
      "SELECT id_tipo_cab FROM tipo_cabana WHERE id_tipo_cab = $1 AND esta_activo = TRUE",
      [cabanaData.id_tipo_cab]
    );

    if (tipoCabana.rows.length === 0) {
      throw new Error("TIPO_CABANA_NOT_FOUND");
    }

    // Verificar que la zona existe y está activa
    const zona = await client.query(
      "SELECT id_zona FROM zonas WHERE id_zona = $1 AND esta_activa = TRUE",
      [cabanaData.id_zona]
    );

    if (zona.rows.length === 0) {
      throw new Error("ZONA_NOT_FOUND");
    }

    // Crear la cabaña
    const result = await client.query(
      `INSERT INTO cabana (
        cod_cabana, id_tipo_cab, id_zona, 
        esta_activo, en_mantenimiento, fecha_creacion, id_usuario_creacion
      )
      VALUES ($1, $2, $3, TRUE, FALSE, NOW(), $4)
      RETURNING id_cabana, cod_cabana, id_tipo_cab, id_zona, esta_activo, en_mantenimiento, fecha_creacion`,
      [
        cabanaData.cod_cabana,
        cabanaData.id_tipo_cab,
        cabanaData.id_zona,
        idUsuario,
      ]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en crearCabana:", error);

    if (error.message === "CABANA_CODE_EXISTS") {
      throw new Error("Ya existe una cabaña con ese código");
    }
    if (error.message === "TIPO_CABANA_NOT_FOUND") {
      throw new Error("El tipo de cabaña no existe o no está activo");
    }
    if (error.message === "ZONA_NOT_FOUND") {
      throw new Error("La zona no existe o no está activa");
    }

    throw new Error("Error al crear la cabaña");
  } finally {
    client.release();
  }
};

/**
 * Actualizar una cabaña (Admin)
 * @param {number} idCabana - ID de la cabaña a actualizar
 * @param {Object} cabanaData - Datos a actualizar
 * @param {number} idUsuario - ID del usuario que actualiza
 * @returns {Promise<Object>} Cabaña actualizada
 */
export const actualizarCabanaAdmin = async (idCabana, cabanaData, idUsuario) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar que la cabaña existe
    const cabanaExiste = await client.query(
      "SELECT id_cabana FROM cabana WHERE id_cabana = $1",
      [idCabana]
    );

    if (cabanaExiste.rows.length === 0) {
      throw new Error("CABANA_NOT_FOUND");
    }

    // Si se está actualizando el código, verificar que no exista otra cabaña con ese código
    if (cabanaData.cod_cabana) {
      const codigoExiste = await client.query(
        "SELECT id_cabana FROM cabana WHERE LOWER(cod_cabana) = LOWER($1) AND id_cabana != $2",
        [cabanaData.cod_cabana, idCabana]
      );

      if (codigoExiste.rows.length > 0) {
        throw new Error("CABANA_CODE_EXISTS");
      }
    }

    // Verificar referencias si se están actualizando
    if (cabanaData.id_tipo_cab) {
      const tipoCabana = await client.query(
        "SELECT id_tipo_cab FROM tipo_cabana WHERE id_tipo_cab = $1 AND esta_activo = TRUE",
        [cabanaData.id_tipo_cab]
      );

      if (tipoCabana.rows.length === 0) {
        throw new Error("TIPO_CABANA_NOT_FOUND");
      }
    }

    if (cabanaData.id_zona) {
      const zona = await client.query(
        "SELECT id_zona FROM zonas WHERE id_zona = $1 AND esta_activa = TRUE",
        [cabanaData.id_zona]
      );

      if (zona.rows.length === 0) {
        throw new Error("ZONA_NOT_FOUND");
      }
    }

    // Construir query dinámico para actualizar solo los campos proporcionados
    const campos = [];
    const valores = [];
    let paramCount = 1;

    if (cabanaData.cod_cabana !== undefined) {
      campos.push(`cod_cabana = $${paramCount}`);
      valores.push(cabanaData.cod_cabana);
      paramCount++;
    }

    if (cabanaData.id_tipo_cab !== undefined) {
      campos.push(`id_tipo_cab = $${paramCount}`);
      valores.push(cabanaData.id_tipo_cab);
      paramCount++;
    }

    if (cabanaData.id_zona !== undefined) {
      campos.push(`id_zona = $${paramCount}`);
      valores.push(cabanaData.id_zona);
      paramCount++;
    }

    if (cabanaData.esta_activo !== undefined) {
      campos.push(`esta_activo = $${paramCount}`);
      valores.push(cabanaData.esta_activo);
      paramCount++;
    }

    if (cabanaData.en_mantenimiento !== undefined) {
      campos.push(`en_mantenimiento = $${paramCount}`);
      valores.push(cabanaData.en_mantenimiento);
      paramCount++;
    }

    if (campos.length === 0) {
      throw new Error("NO_FIELDS_TO_UPDATE");
    }

    campos.push(`fecha_modific = NOW()`);
    campos.push(`id_usuario_modific = $${paramCount}`);
    valores.push(idUsuario);
    paramCount++;

    valores.push(idCabana);

    const query = `
      UPDATE cabana
      SET ${campos.join(", ")}
      WHERE id_cabana = $${paramCount}
      RETURNING id_cabana, cod_cabana, id_tipo_cab, id_zona, esta_activo, en_mantenimiento, fecha_modific
    `;

    const result = await client.query(query, valores);

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en actualizarCabanaAdmin:", error);

    if (error.message === "CABANA_NOT_FOUND") {
      throw new Error("La cabaña no existe");
    }
    if (error.message === "CABANA_CODE_EXISTS") {
      throw new Error("Ya existe otra cabaña con ese código");
    }
    if (error.message === "TIPO_CABANA_NOT_FOUND") {
      throw new Error("El tipo de cabaña no existe o no está activo");
    }
    if (error.message === "ZONA_NOT_FOUND") {
      throw new Error("La zona no existe o no está activa");
    }
    if (error.message === "NO_FIELDS_TO_UPDATE") {
      throw error;
    }

    throw new Error("Error al actualizar la cabaña");
  } finally {
    client.release();
  }
};

/**
 * Actualizar mantenimiento de cabaña (Operador y Admin)
 * Cambia el estado de en_mantenimiento
 * @param {number} idCabana - ID de la cabaña a actualizar
 * @param {boolean} enMantenimiento - Nuevo estado de mantenimiento
 * @param {number} idUsuario - ID del usuario que actualiza
 * @returns {Promise<Object>} Cabaña actualizada
 */
export const actualizarMantenimientoCabana = async (
  idCabana,
  enMantenimiento,
  idUsuario
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar que la cabaña existe y está activa
    const cabanaExiste = await client.query(
      "SELECT id_cabana, esta_activo FROM cabana WHERE id_cabana = $1",
      [idCabana]
    );

    if (cabanaExiste.rows.length === 0) {
      throw new Error("CABANA_NOT_FOUND");
    }

    if (!cabanaExiste.rows[0].esta_activo) {
      throw new Error("CABANA_INACTIVE");
    }

    // Actualizar solo el estado de mantenimiento
    const result = await client.query(
      `UPDATE cabana
       SET en_mantenimiento = $1, 
           fecha_modific = NOW(),
           id_usuario_modific = $2
       WHERE id_cabana = $3
       RETURNING id_cabana, cod_cabana, id_tipo_cab, id_zona, esta_activo, en_mantenimiento, fecha_modific`,
      [enMantenimiento, idUsuario, idCabana]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en actualizarMantenimientoCabana:", error);

    if (error.message === "CABANA_NOT_FOUND") {
      throw new Error("La cabaña no existe");
    }
    if (error.message === "CABANA_INACTIVE") {
      throw new Error(
        "No se puede cambiar el mantenimiento de una cabaña inactiva"
      );
    }

    throw new Error("Error al actualizar el mantenimiento de la cabaña");
  } finally {
    client.release();
  }
};

/**
 * Eliminar (borrado lógico) una cabaña - Solo Admin
 * Cambia esta_activo a FALSE
 * @param {number} idCabana - ID de la cabaña a eliminar
 * @param {number} idUsuario - ID del usuario que elimina
 * @returns {Promise<Object>} Cabaña eliminada
 */
export const eliminarCabana = async (idCabana, idUsuario) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar que la cabaña existe y está activa
    const cabanaExiste = await client.query(
      "SELECT id_cabana, esta_activo FROM cabana WHERE id_cabana = $1",
      [idCabana]
    );

    if (cabanaExiste.rows.length === 0) {
      throw new Error("CABANA_NOT_FOUND");
    }

    if (!cabanaExiste.rows[0].esta_activo) {
      throw new Error("CABANA_ALREADY_DELETED");
    }

    // Verificar si hay reservas activas
    const reservasActivas = await client.query(
      `SELECT COUNT(*) as total 
       FROM cabanas_reserva cr
       INNER JOIN reserva r ON cr.id_reserva = r.id_reserva
       INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
       WHERE cr.id_cabana = $1
         AND r.check_out >= CURRENT_DATE
         AND eo.nom_estado NOT IN ('Cancelada')`,
      [idCabana]
    );

    if (parseInt(reservasActivas.rows[0].total) > 0) {
      throw new Error("CABANA_HAS_ACTIVE_RESERVATIONS");
    }

    // Realizar borrado lógico
    const result = await client.query(
      `UPDATE cabana
       SET esta_activo = FALSE,
           fecha_modific = NOW(),
           id_usuario_modific = $1
       WHERE id_cabana = $2
       RETURNING id_cabana, cod_cabana, id_tipo_cab, id_zona, esta_activo, en_mantenimiento, fecha_modific`,
      [idUsuario, idCabana]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en eliminarCabana:", error);

    if (error.message === "CABANA_NOT_FOUND") {
      throw new Error("La cabaña no existe");
    }
    if (error.message === "CABANA_ALREADY_DELETED") {
      throw new Error("La cabaña ya está eliminada");
    }
    if (error.message === "CABANA_HAS_ACTIVE_RESERVATIONS") {
      throw new Error(
        "No se puede eliminar la cabaña porque tiene reservas activas"
      );
    }

    throw new Error("Error al eliminar la cabaña");
  } finally {
    client.release();
  }
};

/**
 * Restaurar una cabaña eliminada - Solo Admin
 * @param {number} idCabana - ID de la cabaña a restaurar
 * @param {number} idUsuario - ID del usuario que restaura
 * @returns {Promise<Object>} Cabaña restaurada
 */
export const restaurarCabana = async (idCabana, idUsuario) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verificar que la cabaña existe y está inactiva
    const cabanaExiste = await client.query(
      "SELECT id_cabana, esta_activo FROM cabana WHERE id_cabana = $1",
      [idCabana]
    );

    if (cabanaExiste.rows.length === 0) {
      throw new Error("CABANA_NOT_FOUND");
    }

    if (cabanaExiste.rows[0].esta_activo) {
      throw new Error("CABANA_ALREADY_ACTIVE");
    }

    // Restaurar la cabaña
    const result = await client.query(
      `UPDATE cabana
       SET esta_activo = TRUE,
           fecha_modific = NOW(),
           id_usuario_modific = $1
       WHERE id_cabana = $2
       RETURNING id_cabana, cod_cabana, id_tipo_cab, id_zona, esta_activo, en_mantenimiento, fecha_modific`,
      [idUsuario, idCabana]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en restaurarCabana:", error);

    if (error.message === "CABANA_NOT_FOUND") {
      throw new Error("La cabaña no existe");
    }
    if (error.message === "CABANA_ALREADY_ACTIVE") {
      throw new Error("La cabaña ya está activa");
    }

    throw new Error("Error al restaurar la cabaña");
  } finally {
    client.release();
  }
};
