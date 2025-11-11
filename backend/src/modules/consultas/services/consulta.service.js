/**
 * Servicios de lógica de negocio para el módulo de Consultas
 * Maneja todas las operaciones CRUD y la lógica de respuesta de consultas
 */

import { pool } from "../../../config/database.js";
import { enviarRespuestaConsulta } from "../../../utils/email.service.js";

/**
 * Crea una nueva consulta desde el formulario público.
 * No requiere autenticación.
 * @param {Object} datosConsulta - Datos de la consulta
 * @param {string} datosConsulta.nomCli - Nombre del cliente
 * @param {string} datosConsulta.emailCli - Email del cliente
 * @param {string} datosConsulta.titulo - Título de la consulta (opcional)
 * @param {string} datosConsulta.mensajeCli - Mensaje del cliente
 * @returns {Promise<Object>} Consulta creada
 */
export const crearConsulta = async ({ nomCli, emailCli, titulo, mensajeCli }) => {
  try {
    const query = `
      INSERT INTO consulta (
        nom_cli, email_cli, titulo, mensaje_cli, 
        fecha_consulta, esta_respondida
      ) 
      VALUES ($1, $2, $3, $4, NOW(), FALSE)
      RETURNING *
    `;

    const valores = [nomCli, emailCli, titulo || null, mensajeCli];

    const resultado = await pool.query(query, valores);

    console.log(`Nueva consulta creada: ID ${resultado.rows[0].id_consulta} de ${nomCli}`);

    return resultado.rows[0];
  } catch (error) {
    console.error("Error en crearConsulta:", error);
    throw new Error("Error al crear la consulta");
  }
};

/**
 * Obtiene una lista de consultas con filtros opcionales.
 * Solo accesible para Operadores y Administradores.
 * @param {Object} filtros - Filtros de búsqueda
 * @param {boolean} filtros.estaRespondida - Filtrar por estado de respuesta (por defect: false)
 * @param {string} filtros.periodo - Período de tiempo: "hoy", "semana", "mes", "todo" (por defecto: "todo")
 * @param {string} filtros.busqueda - Texto para buscar en nombre, email o título
 * @returns {Promise<Array>} Lista de consultas
 */
export const listarConsultas = async (filtros = {}) => {
  try {
    let query = `
      SELECT 
        c.id_consulta,
        c.nom_cli,
        c.email_cli,
        c.titulo,
        c.fecha_consulta,
        c.esta_respondida,
        c.fecha_respuesta,
        c.id_usuario_respuesta,
        u.nombre as nombre_operador
      FROM consulta c
      LEFT JOIN usuario u ON c.id_usuario_respuesta = u.id_usuario
      WHERE 1=1
    `;

    const parametros = [];
    let contadorParam = 1;

    // Filtro por estado de respuesta (por defecto muestra las no respondidas)
    const estaRespondida = filtros.estaRespondida !== undefined
      ? filtros.estaRespondida
      : false;
      query += ` AND c.esta_respondida = $${contadorParam}`;
    parametros.push(estaRespondida);
    contadorParam++;

    // Filtro por período de tiempo (por defecto: "todo")
    const periodo = filtros.periodo || "todo";
    
    if (periodo !== "todo") {
      let fechaDesde;
      const ahora = new Date();
      
      switch (periodo) {
        case "hoy":
          // Desde las 00:00:00 de hoy
          fechaDesde = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
          break;
        case "semana":
          // Últimos 7 días
          fechaDesde = new Date(ahora);
          fechaDesde.setDate(fechaDesde.getDate() - 7);
          break;
        case "mes":
          // Últimos 30 días
          fechaDesde = new Date(ahora);
          fechaDesde.setDate(fechaDesde.getDate() - 30);
          break;
      }
      
      if (fechaDesde) {
        query += ` AND c.fecha_consulta >= $${contadorParam}`;
        parametros.push(fechaDesde);
        contadorParam++;
      }
    }

    // Filtro de búsqueda por nombre, email o título
    if (filtros.busqueda) {
      query += ` AND (
        c.nom_cli ILIKE $${contadorParam} OR 
        c.email_cli ILIKE $${contadorParam} OR 
        c.titulo ILIKE $${contadorParam}
      )`;
      parametros.push(`%${filtros.busqueda}%`);
      contadorParam++;
    }

    // Ordenar por fecha de consulta (más recientes primero)
    query += ` ORDER BY c.fecha_consulta DESC`;

    const resultado = await pool.query(query, parametros);

    return resultado.rows;
  } catch (error) {
    console.error("Error en listarConsultas:", error);
    throw new Error("Error al listar las consultas");
  }
};

/**
 * Obtiene el detalle completo de una consulta por su ID.
 * @param {number} idConsulta - ID de la consulta
 * @returns {Promise<Object>} Detalle de la consulta
 */
export const obtenerConsultaPorId = async (idConsulta) => {
  try {
    const query = `
      SELECT 
        c.id_consulta,
        c.nom_cli,
        c.email_cli,
        c.titulo,
        c.mensaje_cli,
        c.fecha_consulta,
        c.esta_respondida,
        c.respuesta_op,
        c.fecha_respuesta,
        c.id_usuario_respuesta,
        u.nombre as nombre_operador,
        u.email as email_operador
      FROM consulta c
      LEFT JOIN usuario u ON c.id_usuario_respuesta = u.id_usuario
      WHERE c.id_consulta = $1
    `;

    const resultado = await pool.query(query, [idConsulta]);

    if (resultado.rows.length === 0) {
      throw new Error("CONSULTA_NO_ENCONTRADA");
    }

    return resultado.rows[0];
  } catch (error) {
    console.error("Error en obtenerConsultaPorId:", error);
    
    if (error.message === "CONSULTA_NO_ENCONTRADA") {
      throw error;
    }
    
    throw new Error("Error al obtener el detalle de la consulta");
  }
};

/**
 * Responde una consulta y envía un email al cliente.
 * Solo accesible para Operadores y Administradores.
 * @param {number} idConsulta - ID de la consulta a responder
 * @param {string} respuestaOp - Respuesta del operador
 * @param {number} idUsuarioRespuesta - ID del operador que responde
 * @returns {Promise<Object>} Consulta actualizada
 */
export const responderConsulta = async (idConsulta, respuestaOp, idUsuarioRespuesta) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Obtener la consulta actual
    const consultaActual = await client.query(
      `SELECT * FROM consulta WHERE id_consulta = $1`,
      [idConsulta]
    );

    if (consultaActual.rows.length === 0) {
      throw new Error("CONSULTA_NO_ENCONTRADA");
    }

    const consulta = consultaActual.rows[0];

    // Verificar si ya está respondida
    if (consulta.esta_respondida) {
      throw new Error("CONSULTA_YA_RESPONDIDA");
    }

    // Obtener datos del operador que responde
    const operadorResult = await client.query(
      `SELECT nombre, email FROM usuario WHERE id_usuario = $1`,
      [idUsuarioRespuesta]
    );

    if (operadorResult.rows.length === 0) {
      throw new Error("USUARIO_NO_ENCONTRADO");
    }

    const operador = operadorResult.rows[0];

    // Actualizar la consulta con la respuesta
    const queryActualizar = `
      UPDATE consulta
      SET 
        respuesta_op = $1,
        id_usuario_respuesta = $2,
        fecha_respuesta = NOW(),
        esta_respondida = TRUE
      WHERE id_consulta = $3
      RETURNING *
    `;

    const resultadoActualizar = await client.query(queryActualizar, [
      respuestaOp,
      idUsuarioRespuesta,
      idConsulta,
    ]);

    // Enviar email al cliente con la respuesta
    try {
      await enviarRespuestaConsulta({
        emailDestinatario: consulta.email_cli,
        nombreCliente: consulta.nom_cli,
        tituloConsulta: consulta.titulo,
        mensajeCliente: consulta.mensaje_cli,
        respuestaOperador: respuestaOp,
        nombreOperador: operador.nombre,
      });

      console.log(`Email de respuesta enviado a ${consulta.email_cli}`);
    } catch (emailError) {
      console.error("Error al enviar email:", emailError);
      // No hacemos rollback porque la respuesta sí se guardó
      // Solo logeamos el error del email
      console.warn("La consulta fue respondida pero el email no pudo ser enviado");
    }

    await client.query("COMMIT");

    return resultadoActualizar.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en responderConsulta:", error);

    if (error.message === "CONSULTA_NO_ENCONTRADA") {
      throw new Error("La consulta no existe");
    }

    if (error.message === "CONSULTA_YA_RESPONDIDA") {
      throw new Error("Esta consulta ya ha sido respondida");
    }

    if (error.message === "USUARIO_NO_ENCONTRADO") {
      throw new Error("El usuario que intenta responder no existe");
    }

    throw new Error("Error al responder la consulta");
  } finally {
    client.release();
  }
};

/**
 * Obtiene estadísticas de las consultas.
 * @returns {Promise<Object>} Estadísticas de consultas
 */
export const obtenerEstadisticasConsultas = async () => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_consultas,
        COUNT(*) FILTER (WHERE esta_respondida = TRUE) as respondidas,
        COUNT(*) FILTER (WHERE esta_respondida = FALSE) as pendientes,
        COUNT(*) FILTER (WHERE fecha_consulta >= CURRENT_DATE - INTERVAL '7 days') as ultima_semana,
        COUNT(*) FILTER (WHERE fecha_consulta >= CURRENT_DATE - INTERVAL '30 days') as ultimo_mes
      FROM consulta
    `;

    const resultado = await pool.query(query);

    return resultado.rows[0];
  } catch (error) {
    console.error("Error en obtenerEstadisticasConsultas:", error);
    throw new Error("Error al obtener las estadísticas de consultas");
  }
};
