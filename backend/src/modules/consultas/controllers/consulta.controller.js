/**
 * Controladores para el módulo de Consultas
 * Maneja las peticiones HTTP y delega la lógica a los services
 */

import * as consultaService from "../services/consulta.service.js";
import {
  validateCrearConsulta,
  validateFiltrosConsultas,
  validateResponderConsulta,
} from "../schemas/consulta.schemas.js";

/**
 * POST /api/consultas
 * Crear una nueva consulta desde el formulario público
 * Acceso: Público (sin autenticación)
 */
export const crearConsulta = async (req, res) => {
  try {
    // Validar los datos de entrada
    const validation = validateCrearConsulta(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    // Crear la consulta
    const consulta = await consultaService.crearConsulta(req.body);

    res.status(201).json({
      ok: true,
      message: "Consulta creada exitosamente. Le responderemos a la brevedad.",
      data: {
        id_consulta: consulta.id_consulta,
        nom_cli: consulta.nom_cli,
        email_cli: consulta.email_cli,
        titulo: consulta.titulo,
        fecha_consulta: consulta.fecha_consulta,
      },
    });
  } catch (error) {
    console.error("Error en crearConsulta:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Error al crear la consulta",
    });
  }
};

/**
 * GET /api/consultas
 * Listar consultas con filtros opcionales
 * Acceso: Operador / Administrador
 */
export const listarConsultas = async (req, res) => {
  try {
    // Validar los filtros
    const filtros = {
      estaRespondida: req.query.estaRespondida,
      periodo: req.query.periodo,
      busqueda: req.query.busqueda,
    };

    const validation = validateFiltrosConsultas(filtros);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    // Parsear filtros
    const filtrosParsed = {
      estaRespondida:
        req.query.estaRespondida !== undefined
          ? req.query.estaRespondida === "true"
          : false, // Por defecto, mostrar solo consultas no respondidas
      periodo: req.query.periodo || "todo",
      busqueda: req.query.busqueda,
    };

    // Obtener consultas
    const consultas = await consultaService.listarConsultas(filtrosParsed);

    res.json({
      ok: true,
      data: consultas,
      total: consultas.length,
      filtros: filtrosParsed,
    });
  } catch (error) {
    console.error("Error en listarConsultas:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Error al listar las consultas",
    });
  }
};

/**
 * GET /api/consultas/:id
 * Obtener detalle de una consulta específica
 * Acceso: Operador / Administrador
 */
export const obtenerConsulta = async (req, res) => {
  try {
    const idConsulta = parseInt(req.params.id);

    // Validar que el ID sea un número válido
    if (isNaN(idConsulta)) {
      return res.status(400).json({
        ok: false,
        error: "ID de consulta inválido",
      });
    }

    // Obtener la consulta
    const consulta = await consultaService.obtenerConsultaPorId(idConsulta);

    res.json({
      ok: true,
      data: consulta,
    });
  } catch (error) {
    console.error("Error en obtenerConsulta:", error);

    if (error.message === "CONSULTA_NO_ENCONTRADA") {
      return res.status(404).json({
        ok: false,
        error: "La consulta no existe",
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al obtener la consulta",
    });
  }
};

/**
 * POST /api/consultas/:id/responder
 * Responder una consulta y enviar email al cliente
 * Acceso: Operador / Administrador
 */
export const responderConsulta = async (req, res) => {
  try {
    const idConsulta = parseInt(req.params.id);

    // Validar que el ID sea un número válido
    if (isNaN(idConsulta)) {
      return res.status(400).json({
        ok: false,
        error: "ID de consulta inválido",
      });
    }

    // Validar los datos de la respuesta
    const validation = validateResponderConsulta(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        ok: false,
        errors: validation.errors,
      });
    }

    // Responder la consulta
    const consulta = await consultaService.responderConsulta(
      idConsulta,
      req.body.respuestaOp,
      req.user.id_usuario
    );

    res.json({
      ok: true,
      message: "Consulta respondida exitosamente. Se ha enviado un email al cliente.",
      data: consulta,
    });
  } catch (error) {
    console.error("Error en responderConsulta:", error);

    if (error.message.includes("no existe")) {
      return res.status(404).json({
        ok: false,
        error: error.message,
      });
    }

    if (error.message.includes("ya ha sido respondida")) {
      return res.status(400).json({
        ok: false,
        error: error.message,
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Error al responder la consulta",
    });
  }
};

/**
 * GET /api/consultas/estadisticas
 * Obtener estadísticas de consultas
 * Acceso: Operador / Administrador
 */
export const obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await consultaService.obtenerEstadisticasConsultas();

    res.json({
      ok: true,
      data: estadisticas,
    });
  } catch (error) {
    console.error("Error en obtenerEstadisticas:", error);
    res.status(500).json({
      ok: false,
      error: error.message || "Error al obtener las estadísticas",
    });
  }
};
