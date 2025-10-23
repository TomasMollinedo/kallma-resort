/**
 * Servicios de lógica de negocio para el módulo de Reservas
 * Maneja todas las operaciones CRUD y reglas de negocio complejas
 */

import { pool } from "../../../config/database.js";

/**
 * Genera un código único de reserva
 * Formato: RES-YYYYMMDD-XXXXX
 */
const generarCodigoReserva = async () => {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  const prefijo = `RES-${year}${month}${day}`;

  const result = await pool.query(
    `SELECT cod_reserva FROM reserva 
     WHERE cod_reserva LIKE $1 
     ORDER BY cod_reserva DESC LIMIT 1`,
    [`${prefijo}%`]
  );

  let secuencial = 1;
  if (result.rows.length > 0) {
    const ultimoCodigo = result.rows[0].cod_reserva;
    const ultimoSecuencial = parseInt(ultimoCodigo.split("-")[2]);
    secuencial = ultimoSecuencial + 1;
  }

  return `${prefijo}-${String(secuencial).padStart(5, "0")}`;
};

/**
 * Normaliza una fecha a formato YYYY-MM-DD sin zona horaria.
 * Admite strings ISO, instancias de Date y valores falsy.
 * @param {string|Date|null|undefined} fecha - Valor de fecha recibido desde capa superior.
 * @returns {string|null} Fecha normalizada o null si no se proporcionó.
 */
const normalizarFecha = (fecha) => {
  if (!fecha) {
    return null;
  }

  if (fecha instanceof Date) {
    return fecha.toISOString().split("T")[0];
  }

  if (typeof fecha === "string") {
    return fecha.split("T")[0];
  }

  return String(fecha);
};

/**
 * Consultar disponibilidad de cabañas
 */
export const consultarDisponibilidad = async ({ check_in, check_out, cant_personas }) => {
  try {
    // Asegurar que las fechas sean strings en formato YYYY-MM-DD
    const checkInStr = normalizarFecha(check_in);
    const checkOutStr = normalizarFecha(check_out);
    
    const query = `
      SELECT 
        c.id_cabana, c.cod_cabana, c.id_tipo_cab,
        tc.nom_tipo_cab, tc.capacidad, tc.precio_noche,
        c.id_zona, z.nom_zona
      FROM cabana c
      INNER JOIN tipo_cabana tc ON c.id_tipo_cab = tc.id_tipo_cab
      INNER JOIN zonas z ON c.id_zona = z.id_zona
      WHERE c.esta_activo = TRUE
        AND c.en_mantenimiento = FALSE
        AND tc.esta_activo = TRUE
        AND z.esta_activa = TRUE
        AND NOT EXISTS (
          SELECT 1 FROM cabanas_reserva cr
          INNER JOIN reserva r ON cr.id_reserva = r.id_reserva
          INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
          WHERE cr.id_cabana = c.id_cabana
            AND eo.nom_estado NOT IN ('Cancelada')
            AND (
              (r.check_in <= $1::date AND r.check_out > $1::date) OR
              (r.check_in < $2::date AND r.check_out >= $2::date) OR
              (r.check_in >= $1::date AND r.check_out <= $2::date)
            )
        )
      ORDER BY tc.capacidad ASC, c.cod_cabana ASC
    `;

    const result = await pool.query(query, [checkInStr, checkOutStr]);
    
    const checkInDate = new Date(`${checkInStr}T00:00:00`);
    const checkOutDate = new Date(`${checkOutStr}T00:00:00`);
    const noches = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    const cabanas = result.rows.map(cabana => ({
      ...cabana,
      noches,
      precio_total: parseFloat(cabana.precio_noche) * noches
    }));

    return cabanas;
  } catch (error) {
    console.error("Error en consultarDisponibilidad:", error);
    throw new Error("Error al consultar disponibilidad de cabañas");
  }
};

/**
 * Crear una nueva reserva
 */
export const crearReserva = async ({ check_in, check_out, cant_personas, cabanas_ids, servicios_ids = [] }, idUsuario) => {
  const client = await pool.connect();

  try {
    // Asegurar que las fechas sean strings en formato YYYY-MM-DD
    const checkInStr = normalizarFecha(check_in);
    const checkOutStr = normalizarFecha(check_out);
    
    await client.query("BEGIN");

    // Validar cabañas
    const cabanasQuery = await client.query(
      `SELECT c.id_cabana, c.cod_cabana, c.esta_activo, c.en_mantenimiento, 
              tc.precio_noche, tc.capacidad
       FROM cabana c
       INNER JOIN tipo_cabana tc ON c.id_tipo_cab = tc.id_tipo_cab
       WHERE c.id_cabana = ANY($1::int[])`,
      [cabanas_ids]
    );

    if (cabanasQuery.rows.length !== cabanas_ids.length) {
      throw new Error("ALGUNAS_CABANAS_NO_EXISTEN");
    }

    const cabanasInactivas = cabanasQuery.rows.filter(c => !c.esta_activo || c.en_mantenimiento);
    if (cabanasInactivas.length > 0) {
      throw new Error("CABANAS_NO_DISPONIBLES");
    }

    // Validar que la suma de capacidades sea suficiente
    const capacidadTotal = cabanasQuery.rows.reduce((sum, cabana) => sum + parseInt(cabana.capacidad), 0);
    if (capacidadTotal < cant_personas) {
      throw new Error("CAPACIDAD_INSUFICIENTE");
    }

    // Verificar disponibilidad
    const disponibilidadQuery = await client.query(
      `SELECT cr.id_cabana FROM cabanas_reserva cr
       INNER JOIN reserva r ON cr.id_reserva = r.id_reserva
       INNER JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
       WHERE cr.id_cabana = ANY($1::int[])
         AND eo.nom_estado NOT IN ('Cancelada')
         AND (
           (r.check_in <= $2::date AND r.check_out > $2::date) OR
           (r.check_in < $3::date AND r.check_out >= $3::date) OR
           (r.check_in >= $2::date AND r.check_out <= $3::date)
         )`,
      [cabanas_ids, checkInStr, checkOutStr]
    );

    if (disponibilidadQuery.rows.length > 0) {
      throw new Error("CABANAS_NO_DISPONIBLES_EN_FECHAS");
    }

    // Calcular monto total
    const checkInDate = new Date(`${checkInStr}T00:00:00`);
    const checkOutDate = new Date(`${checkOutStr}T00:00:00`);
    const noches = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    let montoTotal = 0;
    cabanasQuery.rows.forEach(cabana => {
      montoTotal += parseFloat(cabana.precio_noche) * noches;
    });

    if (servicios_ids.length > 0) {
      const serviciosQuery = await client.query(
        `SELECT id_servicio, precio_servicio FROM servicios WHERE id_servicio = ANY($1::int[])`,
        [servicios_ids]
      );

      if (serviciosQuery.rows.length !== servicios_ids.length) {
        throw new Error("ALGUNOS_SERVICIOS_NO_EXISTEN");
      }

      // Precio de servicio es por persona por noche
      serviciosQuery.rows.forEach(servicio => {
        montoTotal += parseFloat(servicio.precio_servicio) * noches * cant_personas;
      });
    }

    const codigoReserva = await generarCodigoReserva();

    // Obtener el ID del estado "Confirmada" para reservas nuevas
    const estadoResult = await client.query(
      `SELECT id_est_op FROM estado_operativo WHERE nom_estado = 'Confirmada'`
    );
    
    if (estadoResult.rows.length === 0) {
      throw new Error("ESTADO_CONFIRMADA_NO_EXISTE");
    }
    
    const idEstadoConfirmada = estadoResult.rows[0].id_est_op;

    // Crear reserva
    const reservaResult = await client.query(
      `INSERT INTO reserva (
        cod_reserva, check_in, check_out, cant_personas,
        id_est_op, esta_pagada, monto_total_res, monto_pagado,
        fecha_creacion, id_usuario_creacion
      ) VALUES ($1, $2::date, $3::date, $4, $5, FALSE, $6, 0, NOW(), $7)
      RETURNING *`,
      [codigoReserva, checkInStr, checkOutStr, cant_personas, idEstadoConfirmada, montoTotal, idUsuario]
    );

    const reserva = reservaResult.rows[0];

    // Insertar cabañas
    for (const idCabana of cabanas_ids) {
      await client.query(
        `INSERT INTO cabanas_reserva (id_cabana, id_reserva) VALUES ($1, $2)`,
        [idCabana, reserva.id_reserva]
      );
    }

    // Insertar servicios
    for (const idServicio of servicios_ids) {
      await client.query(
        `INSERT INTO servicio_reserva (id_reserva, id_servicio) VALUES ($1, $2)`,
        [reserva.id_reserva, idServicio]
      );
    }

    await client.query("COMMIT");
    return await obtenerReservaPorId(reserva.id_reserva, idUsuario);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en crearReserva:", error);

    if (error.message === "ALGUNAS_CABANAS_NO_EXISTEN") {
      throw new Error("Algunas cabañas seleccionadas no existen");
    }
    if (error.message === "CABANAS_NO_DISPONIBLES") {
      throw new Error("Algunas cabañas no están disponibles");
    }
    if (error.message === "CAPACIDAD_INSUFICIENTE") {
      throw new Error("La capacidad total de las cabañas seleccionadas es menor que la cantidad de personas");
    }
    if (error.message === "CABANAS_NO_DISPONIBLES_EN_FECHAS") {
      throw new Error("Algunas cabañas ya están reservadas en las fechas seleccionadas");
    }
    if (error.message === "ALGUNOS_SERVICIOS_NO_EXISTEN") {
      throw new Error("Algunos servicios seleccionados no existen");
    }
    if (error.message === "ESTADO_CONFIRMADA_NO_EXISTE") {
      throw new Error("Error de configuración: estado 'Confirmada' no existe en la base de datos");
    }

    throw new Error("Error al crear la reserva");
  } finally {
    client.release();
  }
};

/**
 * Obtener reservas de un cliente
 */
export const obtenerReservasCliente = async (idUsuario, filters = {}) => {
  try {
    let query = `
      SELECT 
        r.id_reserva, r.cod_reserva, r.check_in, r.check_out, r.cant_personas,
        r.id_est_op, eo.nom_estado as estado_operativo,
        r.esta_pagada, r.monto_total_res, r.monto_pagado,
        r.fecha_creacion, r.fecha_modific,
        COUNT(DISTINCT cr.id_cabana) as cantidad_cabanas,
        COUNT(DISTINCT sr.id_servicio) as cantidad_servicios
      FROM reserva r
      LEFT JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
      LEFT JOIN cabanas_reserva cr ON r.id_reserva = cr.id_reserva
      LEFT JOIN servicio_reserva sr ON r.id_reserva = sr.id_reserva
      WHERE r.id_usuario_creacion = $1
    `;

    const params = [idUsuario];
    let paramCount = 2;

    if (filters.id_est_op) {
      query += ` AND r.id_est_op = $${paramCount}`;
      params.push(filters.id_est_op);
      paramCount++;
    }

    if (filters.esta_pagada !== undefined) {
      query += ` AND r.esta_pagada = $${paramCount}`;
      params.push(filters.esta_pagada);
      paramCount++;
    }

    query += ` GROUP BY r.id_reserva, eo.nom_estado ORDER BY r.fecha_creacion DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error en obtenerReservasCliente:", error);
    throw new Error("Error al obtener las reservas del cliente");
  }
};

/**
 * Obtener todas las reservas (Operador/Admin)
 */
export const obtenerTodasReservas = async (filters = {}) => {
  try {
    let query = `
      SELECT 
        r.id_reserva, r.cod_reserva, r.check_in, r.check_out, r.cant_personas,
        r.id_est_op, eo.nom_estado as estado_operativo,
        r.esta_pagada, r.monto_total_res, r.monto_pagado,
        r.fecha_creacion, r.fecha_modific,
        u.nombre as cliente_nombre, u.email as cliente_email,
        COUNT(DISTINCT cr.id_cabana) as cantidad_cabanas,
        COUNT(DISTINCT sr.id_servicio) as cantidad_servicios
      FROM reserva r
      INNER JOIN usuario u ON r.id_usuario_creacion = u.id_usuario
      LEFT JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
      LEFT JOIN cabanas_reserva cr ON r.id_reserva = cr.id_reserva
      LEFT JOIN servicio_reserva sr ON r.id_reserva = sr.id_reserva
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (filters.cod_reserva) {
      query += ` AND r.cod_reserva ILIKE $${paramCount}`;
      params.push(`%${filters.cod_reserva}%`);
      paramCount++;
    }

    if (filters.check_in) {
      const checkInStr = normalizarFecha(filters.check_in);
      query += ` AND r.check_in >= $${paramCount}`;
      params.push(checkInStr);
      paramCount++;
    }

    if (filters.check_out) {
      const checkOutStr = normalizarFecha(filters.check_out);
      query += ` AND r.check_out <= $${paramCount}`;
      params.push(checkOutStr);
      paramCount++;
    }

    if (filters.id_est_op) {
      query += ` AND r.id_est_op = $${paramCount}`;
      params.push(filters.id_est_op);
      paramCount++;
    }

    if (filters.esta_pagada !== undefined) {
      query += ` AND r.esta_pagada = $${paramCount}`;
      params.push(filters.esta_pagada);
      paramCount++;
    }

    query += ` GROUP BY r.id_reserva, eo.nom_estado, u.nombre, u.email ORDER BY r.fecha_creacion DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error en obtenerTodasReservas:", error);
    throw new Error("Error al obtener las reservas");
  }
};

/**
 * Obtener detalle completo de una reserva
 */
export const obtenerReservaPorId = async (idReserva, idUsuario = null) => {
  try {
    const reservaQuery = `
      SELECT 
        r.id_reserva, r.cod_reserva, r.check_in, r.check_out, r.cant_personas,
        r.id_est_op, eo.nom_estado as estado_operativo,
        r.esta_pagada, r.monto_total_res, r.monto_pagado,
        r.fecha_creacion, r.fecha_modific, r.id_usuario_creacion,
        u.nombre as cliente_nombre, u.email as cliente_email, u.telefono as cliente_telefono,
        uc.nombre as usuario_creacion, um.nombre as usuario_modificacion
      FROM reserva r
      INNER JOIN usuario u ON r.id_usuario_creacion = u.id_usuario
      LEFT JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
      LEFT JOIN usuario uc ON r.id_usuario_creacion = uc.id_usuario
      LEFT JOIN usuario um ON r.id_usuario_modific = um.id_usuario
      WHERE r.id_reserva = $1
    `;

    const reservaResult = await pool.query(reservaQuery, [idReserva]);

    if (reservaResult.rows.length === 0) {
      throw new Error("RESERVA_NOT_FOUND");
    }

    const reserva = reservaResult.rows[0];

    const cabanasQuery = `
      SELECT 
        c.id_cabana, c.cod_cabana,
        tc.nom_tipo_cab, tc.capacidad, tc.precio_noche,
        z.nom_zona
      FROM cabanas_reserva cr
      INNER JOIN cabana c ON cr.id_cabana = c.id_cabana
      INNER JOIN tipo_cabana tc ON c.id_tipo_cab = tc.id_tipo_cab
      INNER JOIN zonas z ON c.id_zona = z.id_zona
      WHERE cr.id_reserva = $1
      ORDER BY c.cod_cabana ASC
    `;

    const cabanasResult = await pool.query(cabanasQuery, [idReserva]);

    const serviciosQuery = `
      SELECT s.id_servicio, s.nom_servicio, s.precio_servicio
      FROM servicio_reserva sr
      INNER JOIN servicios s ON sr.id_servicio = s.id_servicio
      WHERE sr.id_reserva = $1
      ORDER BY s.nom_servicio ASC
    `;

    const serviciosResult = await pool.query(serviciosQuery, [idReserva]);

    // Normalizar fechas para evitar problemas de zona horaria
    const checkInStr = normalizarFecha(reserva.check_in);
    const checkOutStr = normalizarFecha(reserva.check_out);
    const checkInDate = new Date(`${checkInStr}T00:00:00`);
    const checkOutDate = new Date(`${checkOutStr}T00:00:00`);
    const noches = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    return {
      ...reserva,
      noches,
      cabanas: cabanasResult.rows,
      servicios: serviciosResult.rows,
    };
  } catch (error) {
    console.error("Error en obtenerReservaPorId:", error);
    if (error.message === "RESERVA_NOT_FOUND") {
      throw error;
    }
    throw new Error("Error al obtener el detalle de la reserva");
  }
};

/**
 * Actualizar estado de una reserva
 */
export const actualizarEstadoReserva = async (idReserva, updateData, idUsuario, rol) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reservaExiste = await client.query(
      `SELECT r.*, eo.nom_estado FROM reserva r
       LEFT JOIN estado_operativo eo ON r.id_est_op = eo.id_est_op
       WHERE r.id_reserva = $1`,
      [idReserva]
    );

    if (reservaExiste.rows.length === 0) {
      throw new Error("RESERVA_NOT_FOUND");
    }

    const reservaActual = reservaExiste.rows[0];

    if (rol === "Cliente") {
      if (reservaActual.id_usuario_creacion !== idUsuario) {
        throw new Error("NO_ES_PROPIETARIO");
      }

      const estadoCanceladaResult = await client.query(
        `SELECT id_est_op FROM estado_operativo WHERE nom_estado = 'Cancelada'`
      );

      if (estadoCanceladaResult.rows.length === 0) {
        throw new Error("ESTADO_CANCELADA_NO_EXISTE");
      }

      const idEstadoCancelada = estadoCanceladaResult.rows[0].id_est_op;

      if (updateData.id_est_op !== idEstadoCancelada) {
        throw new Error("CLIENTE_SOLO_PUEDE_CANCELAR");
      }

      // Normalizar fecha para evitar problemas de zona horaria
      const checkInStr = normalizarFecha(reservaActual.check_in);
      const checkInDate = new Date(`${checkInStr}T00:00:00`);
      const ahora = new Date();
      const horasHastaCheckIn = (checkInDate - ahora) / (1000 * 60 * 60);

      if (horasHastaCheckIn < 24) {
        throw new Error("CANCELACION_FUERA_DE_PLAZO");
      }

      if (reservaActual.nom_estado === "Cancelada") {
        throw new Error("RESERVA_YA_CANCELADA");
      }
    }

    const campos = [];
    const valores = [];
    let paramCount = 1;

    if (updateData.id_est_op !== undefined) {
      const estadoExiste = await client.query(
        `SELECT id_est_op FROM estado_operativo WHERE id_est_op = $1`,
        [updateData.id_est_op]
      );

      if (estadoExiste.rows.length === 0) {
        throw new Error("ESTADO_NO_EXISTE");
      }

      campos.push(`id_est_op = $${paramCount}`);
      valores.push(updateData.id_est_op);
      paramCount++;
    }

    if (updateData.esta_pagada !== undefined) {
      campos.push(`esta_pagada = $${paramCount}`);
      valores.push(updateData.esta_pagada);
      paramCount++;
    }

    if (updateData.monto_pagado !== undefined) {
      campos.push(`monto_pagado = $${paramCount}`);
      valores.push(updateData.monto_pagado);
      paramCount++;
    }

    if (campos.length === 0) {
      throw new Error("NO_FIELDS_TO_UPDATE");
    }

    campos.push(`fecha_modific = NOW()`);
    campos.push(`id_usuario_modific = $${paramCount}`);
    valores.push(idUsuario);
    paramCount++;

    valores.push(idReserva);

    const query = `
      UPDATE reserva
      SET ${campos.join(", ")}
      WHERE id_reserva = $${paramCount}
      RETURNING *
    `;

    await client.query(query, valores);
    await client.query("COMMIT");
    
    return await obtenerReservaPorId(idReserva, idUsuario);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en actualizarEstadoReserva:", error);

    if (error.message === "RESERVA_NOT_FOUND") {
      throw new Error("La reserva no existe");
    }
    if (error.message === "NO_ES_PROPIETARIO") {
      throw new Error("No tiene permisos para modificar esta reserva");
    }
    if (error.message === "CLIENTE_SOLO_PUEDE_CANCELAR") {
      throw new Error("Los clientes solo pueden cambiar el estado a 'Cancelada'");
    }
    if (error.message === "CANCELACION_FUERA_DE_PLAZO") {
      throw new Error("Solo puede cancelar hasta 24 horas antes del check-in");
    }
    if (error.message === "RESERVA_YA_CANCELADA") {
      throw new Error("La reserva ya está cancelada");
    }
    if (error.message === "ESTADO_NO_EXISTE") {
      throw new Error("El estado operativo no existe");
    }

    throw new Error("Error al actualizar el estado de la reserva");
  } finally {
    client.release();
  }
};
