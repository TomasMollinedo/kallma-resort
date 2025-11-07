/**
 * Servicios de lógica de negocio para el módulo de Pagos
 * Maneja todas las operaciones CRUD y reglas de negocio complejas
 */

import { pool } from "../../../config/database.js";

/**
 * Obtener listado de todos los pagos (Solo Staff)
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Object} { pagos: Array, pagination: Object }
 */
export const obtenerPagos = async (filters) => {
  const { cod_reserva, fecha_desde, fecha_hasta, esta_activo, id_medio_pago, limit = 100, offset = 0 } = filters;

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Filtro por código de reserva (búsqueda parcial)
  if (cod_reserva) {
    conditions.push(`r.cod_reserva ILIKE $${paramIndex}`);
    params.push(`%${cod_reserva}%`);
    paramIndex++;
  }

  // Filtro por rango de fechas
  if (fecha_desde) {
    conditions.push(`p.fecha_pago >= $${paramIndex}::date`);
    params.push(fecha_desde);
    paramIndex++;
  }

  if (fecha_hasta) {
    conditions.push(`p.fecha_pago <= $${paramIndex}::date`);
    params.push(fecha_hasta);
    paramIndex++;
  }

  // Filtro por estado activo/anulado
  if (esta_activo !== undefined) {
    conditions.push(`p.esta_activo = $${paramIndex}`);
    params.push(esta_activo === "true");
    paramIndex++;
  }

  // Filtro por método de pago
  if (id_medio_pago) {
    conditions.push(`p.id_medio_pago = $${paramIndex}`);
    params.push(parseInt(id_medio_pago));
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Query de conteo
  const countQuery = `
    SELECT COUNT(*) as total
    FROM pago p
    INNER JOIN reserva r ON p.id_reserva = r.id_reserva
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].total);

  // Query principal con paginación
  const query = `
    SELECT 
      p.id_pago,
      p.fecha_pago,
      p.monto,
      p.esta_activo,
      p.id_medio_pago,
      mp.nom_medio_pago,
      p.id_reserva,
      r.cod_reserva,
      r.monto_total_res,
      r.esta_pagada,
      r.check_in,
      r.check_out,
      eo.nom_estado as estado_reserva,
      u.nombre as nombre_cliente,
      u.email as email_cliente,
      p.fecha_creacion,
      uc.nombre as usuario_creo_pago
    FROM pago p
    INNER JOIN reserva r ON p.id_reserva = r.id_reserva
    INNER JOIN medio_pago mp ON p.id_medio_pago = mp.id_medio_pago
    INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
    INNER JOIN usuario u ON r.id_usuario_creacion = u.id_usuario
    INNER JOIN usuario uc ON p.id_usuario_creacion = uc.id_usuario
    ${whereClause}
    ORDER BY p.fecha_pago DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(parseInt(limit), parseInt(offset));
  const result = await pool.query(query, params);

  return {
    pagos: result.rows,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: offset + result.rows.length < total,
    },
  };
};

/**
 * Obtener listado de pagos propios del cliente autenticado
 * Los filtros se aplican solo a las reservas del cliente
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} userId - ID del usuario autenticado (cliente)
 * @returns {Object} { pagos: Array, pagination: Object }
 */
export const obtenerPagosPropios = async (filters, userId) => {
  const { cod_reserva, fecha_desde, fecha_hasta, esta_activo, id_medio_pago, limit = 100, offset = 0 } = filters;

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Filtro obligatorio: solo pagos de reservas del cliente
  conditions.push(`r.id_usuario_creacion = $${paramIndex}`);
  params.push(userId);
  paramIndex++;

  // Filtro por código de reserva (búsqueda parcial dentro de sus reservas)
  if (cod_reserva) {
    conditions.push(`r.cod_reserva ILIKE $${paramIndex}`);
    params.push(`%${cod_reserva}%`);
    paramIndex++;
  }

  // Filtro por rango de fechas
  if (fecha_desde) {
    conditions.push(`p.fecha_pago >= $${paramIndex}::date`);
    params.push(fecha_desde);
    paramIndex++;
  }

  if (fecha_hasta) {
    conditions.push(`p.fecha_pago <= $${paramIndex}::date`);
    params.push(fecha_hasta);
    paramIndex++;
  }

  // Filtro por estado activo/anulado
  if (esta_activo !== undefined) {
    conditions.push(`p.esta_activo = $${paramIndex}`);
    params.push(esta_activo === "true");
    paramIndex++;
  }

  // Filtro por método de pago
  if (id_medio_pago) {
    conditions.push(`p.id_medio_pago = $${paramIndex}`);
    params.push(parseInt(id_medio_pago));
    paramIndex++;
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  // Query de conteo
  const countQuery = `
    SELECT COUNT(*) as total
    FROM pago p
    INNER JOIN reserva r ON p.id_reserva = r.id_reserva
    ${whereClause}
  `;

  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].total);

  // Query principal con paginación
  const query = `
    SELECT 
      p.id_pago,
      p.fecha_pago,
      p.monto,
      p.esta_activo,
      p.id_medio_pago,
      mp.nom_medio_pago,
      p.id_reserva,
      r.cod_reserva,
      r.monto_total_res,
      r.esta_pagada,
      r.check_in,
      r.check_out,
      eo.nom_estado as estado_reserva,
      p.fecha_creacion,
      uc.nombre as usuario_creo_pago
    FROM pago p
    INNER JOIN reserva r ON p.id_reserva = r.id_reserva
    INNER JOIN medio_pago mp ON p.id_medio_pago = mp.id_medio_pago
    INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
    INNER JOIN usuario uc ON p.id_usuario_creacion = uc.id_usuario
    ${whereClause}
    ORDER BY p.fecha_pago DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(parseInt(limit), parseInt(offset));
  const result = await pool.query(query, params);

  return {
    pagos: result.rows,
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: offset + result.rows.length < total,
    },
  };
};

/**
 * Obtener detalle completo de un pago por ID
 * @param {number} idPago - ID del pago
 * @param {number} userId - ID del usuario autenticado
 * @param {string} userRole - Rol del usuario
 * @returns {Object} Pago con toda su información
 */
export const obtenerPagoPorId = async (idPago, userId, userRole) => {
  const query = `
    SELECT 
      p.id_pago,
      p.fecha_pago,
      p.monto,
      p.esta_activo,
      p.id_medio_pago,
      mp.nom_medio_pago,
      p.id_reserva,
      r.cod_reserva,
      r.check_in,
      r.check_out,
      r.cant_personas,
      r.monto_total_res,
      r.monto_pagado,
      r.esta_pagada,
      eo.nom_estado as estado_reserva,
      u.id_usuario as id_cliente,
      u.nombre as nombre_cliente,
      u.email as email_cliente,
      u.telefono as telefono_cliente,
      -- Auditoría del pago
      p.id_usuario_creacion,
      uc.nombre as usuario_creacion,
      p.fecha_creacion,
      p.id_usuario_modific,
      um.nombre as usuario_modificacion,
      p.fecha_modific as fecha_modificacion
    FROM pago p
    INNER JOIN reserva r ON p.id_reserva = r.id_reserva
    INNER JOIN medio_pago mp ON p.id_medio_pago = mp.id_medio_pago
    INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
    INNER JOIN usuario u ON r.id_usuario_creacion = u.id_usuario
    INNER JOIN usuario uc ON p.id_usuario_creacion = uc.id_usuario
    LEFT JOIN usuario um ON p.id_usuario_modific = um.id_usuario
    WHERE p.id_pago = $1
  `;

  const result = await pool.query(query, [idPago]);

  if (result.rows.length === 0) {
    throw new Error("PAGO_NOT_FOUND");
  }

  const pago = result.rows[0];

  // Si es Cliente, validar que el pago pertenezca a una reserva suya
  if (userRole === "Cliente" && pago.id_cliente !== userId) {
    throw new Error("FORBIDDEN_ACCESS");
  }

  return pago;
};

/**
 * Obtener historial de pagos de una reserva específica
 * @param {number} idReserva - ID de la reserva
 * @param {number} userId - ID del usuario autenticado
 * @param {string} userRole - Rol del usuario
 * @returns {Array} Pagos de la reserva
 */
export const obtenerPagosPorReserva = async (idReserva, userId, userRole) => {
  // Primero verificar que la reserva existe
  const reservaQuery = `
    SELECT id_reserva, id_usuario_creacion
    FROM reserva
    WHERE id_reserva = $1
  `;
  const reservaResult = await pool.query(reservaQuery, [idReserva]);

  if (reservaResult.rows.length === 0) {
    throw new Error("RESERVA_NOT_FOUND");
  }

  // Si es Cliente, validar que la reserva sea suya
  if (userRole === "Cliente" && reservaResult.rows[0].id_usuario_creacion !== userId) {
    throw new Error("FORBIDDEN_ACCESS");
  }

  // Obtener pagos de la reserva
  const query = `
    SELECT 
      p.id_pago,
      p.fecha_pago,
      p.monto,
      p.esta_activo,
      mp.nom_medio_pago,
      p.fecha_creacion,
      uc.nombre as usuario_creo_pago
    FROM pago p
    INNER JOIN medio_pago mp ON p.id_medio_pago = mp.id_medio_pago
    INNER JOIN usuario uc ON p.id_usuario_creacion = uc.id_usuario
    WHERE p.id_reserva = $1
    ORDER BY p.fecha_pago DESC
  `;

  const result = await pool.query(query, [idReserva]);
  return result.rows;
};

/**
 * Crear un nuevo pago para una reserva
 * @param {Object} pagoData - Datos del pago
 * @param {number} idReserva - ID de la reserva
 * @param {number} userId - ID del usuario que registra el pago
 * @returns {Object} Pago creado con estado actualizado de reserva
 */
export const crearPago = async (pagoData, idReserva, userId) => {
  const { monto, id_medio_pago, fecha_pago } = pagoData;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Verificar que la reserva existe y obtener sus datos
    const reservaQuery = `
      SELECT 
        r.id_reserva,
        r.monto_total_res,
        r.monto_pagado,
        r.esta_pagada,
        r.id_est_op,
        eo.nom_estado
      FROM reserva r
      INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
      WHERE r.id_reserva = $1
    `;
    const reservaResult = await client.query(reservaQuery, [idReserva]);

    if (reservaResult.rows.length === 0) {
      throw new Error("RESERVA_NOT_FOUND");
    }

    const reserva = reservaResult.rows[0];

    // 2. Validar que la reserva esté activa (no finalizada, cancelada ni no_show)
    const estadosNoPermitidos = ["Finalizada", "Cancelada", "No aparecio"];
    if (estadosNoPermitidos.includes(reserva.nom_estado)) {
      throw new Error(`RESERVA_NOT_ACTIVE:${reserva.nom_estado}`);
    }

    // 3. Validar que no se sobrepase el monto total
    const nuevoMontoPagado = parseFloat(reserva.monto_pagado) + parseFloat(monto);
    if (nuevoMontoPagado > parseFloat(reserva.monto_total_res)) {
      const montoRestante = parseFloat(reserva.monto_total_res) - parseFloat(reserva.monto_pagado);
      throw new Error(`MONTO_EXCEDE_TOTAL:${montoRestante}`);
    }

    // 4. Verificar que el método de pago existe
    const medioPagoQuery = `SELECT id_medio_pago FROM medio_pago WHERE id_medio_pago = $1`;
    const medioPagoResult = await client.query(medioPagoQuery, [id_medio_pago]);

    if (medioPagoResult.rows.length === 0) {
      throw new Error("MEDIO_PAGO_INVALID");
    }

    // 5. Insertar el pago
    // Si se proporciona fecha_pago, usarla; sino usar CURRENT_DATE (hoy)
    const fechaPagoFinal = fecha_pago || null;
    
    const insertPagoQuery = `
      INSERT INTO pago (
        fecha_pago,
        monto,
        id_medio_pago,
        id_reserva,
        esta_activo,
        id_usuario_creacion,
        fecha_creacion
      ) VALUES (
        COALESCE($1::DATE, CURRENT_DATE),
        $2,
        $3,
        $4,
        TRUE,
        $5,
        NOW()
      )
      RETURNING id_pago, fecha_pago, monto, id_medio_pago, id_reserva, esta_activo, fecha_creacion
    `;
    const pagoResult = await client.query(insertPagoQuery, [fechaPagoFinal, monto, id_medio_pago, idReserva, userId]);
    const nuevoPago = pagoResult.rows[0];

    // 6. Actualizar monto_pagado de la reserva
    const nuevaEstaPagada = nuevoMontoPagado >= parseFloat(reserva.monto_total_res);

    const updateReservaQuery = `
      UPDATE reserva
      SET 
        monto_pagado = monto_pagado + $1,
        esta_pagada = $2,
        id_usuario_modific = $3,
        fecha_modific = NOW()
      WHERE id_reserva = $4
      RETURNING monto_total_res, monto_pagado, esta_pagada
    `;
    const updateResult = await client.query(updateReservaQuery, [monto, nuevaEstaPagada, userId, idReserva]);
    const reservaActualizada = updateResult.rows[0];

    await client.query("COMMIT");

    // Obtener información completa del pago creado
    const pagoCompletoQuery = `
      SELECT 
        p.id_pago,
        p.fecha_pago,
        p.monto,
        p.esta_activo,
        mp.nom_medio_pago,
        p.id_reserva,
        r.cod_reserva,
        r.monto_total_res,
        r.monto_pagado,
        r.esta_pagada,
        p.fecha_creacion,
        uc.nombre as usuario_creo_pago
      FROM pago p
      INNER JOIN medio_pago mp ON p.id_medio_pago = mp.id_medio_pago
      INNER JOIN reserva r ON p.id_reserva = r.id_reserva
      INNER JOIN usuario uc ON p.id_usuario_creacion = uc.id_usuario
      WHERE p.id_pago = $1
    `;
    const pagoCompletoResult = await client.query(pagoCompletoQuery, [nuevoPago.id_pago]);

    return pagoCompletoResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Anular un pago (borrado lógico)
 * @param {number} idPago - ID del pago a anular
 * @param {number} userId - ID del usuario que anula el pago
 * @returns {Object} Pago anulado con estado actualizado de reserva
 */
export const anularPago = async (idPago, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Verificar que el pago existe y está activo
    const pagoQuery = `
      SELECT 
        p.id_pago,
        p.monto,
        p.esta_activo,
        p.id_reserva,
        r.id_est_op,
        eo.nom_estado,
        r.monto_pagado,
        r.monto_total_res
      FROM pago p
      INNER JOIN reserva r ON p.id_reserva = r.id_reserva
      INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
      WHERE p.id_pago = $1
    `;
    const pagoResult = await client.query(pagoQuery, [idPago]);

    if (pagoResult.rows.length === 0) {
      throw new Error("PAGO_NOT_FOUND");
    }

    const pago = pagoResult.rows[0];

    // 2. Validar que el pago esté activo
    if (!pago.esta_activo) {
      throw new Error("PAGO_ALREADY_ANULADO");
    }

    // 3. Validar que la reserva esté activa (no finalizada, cancelada ni no_show)
    const estadosNoPermitidos = ["Finalizada", "Cancelada", "No aparecio"];
    if (estadosNoPermitidos.includes(pago.nom_estado)) {
      throw new Error(`RESERVA_NOT_ACTIVE:${pago.nom_estado}`);
    }

    // 4. Anular el pago (borrado lógico)
    const updatePagoQuery = `
      UPDATE pago
      SET 
        esta_activo = FALSE,
        id_usuario_modific = $1,
        fecha_modific = NOW()
      WHERE id_pago = $2
      RETURNING id_pago, esta_activo
    `;
    await client.query(updatePagoQuery, [userId, idPago]);

    // 5. Restar el monto del pago del monto_pagado de la reserva
    const nuevoMontoPagado = parseFloat(pago.monto_pagado) - parseFloat(pago.monto);
    const nuevaEstaPagada = nuevoMontoPagado >= parseFloat(pago.monto_total_res);

    const updateReservaQuery = `
      UPDATE reserva
      SET 
        monto_pagado = monto_pagado - $1,
        esta_pagada = $2,
        id_usuario_modific = $3,
        fecha_modific = NOW()
      WHERE id_reserva = $4
      RETURNING monto_total_res, monto_pagado, esta_pagada
    `;
    await client.query(updateReservaQuery, [pago.monto, nuevaEstaPagada, userId, pago.id_reserva]);

    await client.query("COMMIT");

    // Obtener información completa del pago anulado
    const pagoCompletoQuery = `
      SELECT 
        p.id_pago,
        p.fecha_pago,
        p.monto,
        p.esta_activo,
        mp.nom_medio_pago,
        p.id_reserva,
        r.cod_reserva,
        r.monto_total_res,
        r.monto_pagado,
        r.esta_pagada,
        p.fecha_creacion,
        uc.nombre as usuario_creo_pago
      FROM pago p
      INNER JOIN medio_pago mp ON p.id_medio_pago = mp.id_medio_pago
      INNER JOIN reserva r ON p.id_reserva = r.id_reserva
      INNER JOIN usuario uc ON p.id_usuario_creacion = uc.id_usuario
      WHERE p.id_pago = $1
    `;
    const pagoCompletoResult = await client.query(pagoCompletoQuery, [idPago]);

    return pagoCompletoResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
