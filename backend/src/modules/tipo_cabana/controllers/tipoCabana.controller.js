/**
 * Controladores para el módulo de Tipos de Cabaña
 * Maneja las solicitudes HTTP y envía respuestas
 */

import * as tipoCabanaService from "../services/tipoCabana.service.js";

/**
 * GET /api/tipo-cabana
 * Listar todos los tipos de cabaña con filtros opcionales
 */
export const listarTiposCabana = async (req, res) => {
  try {
    const filters = {};

    // Filtro por estado activo
    if (req.query.esta_activo !== undefined) {
      filters.esta_activo = req.query.esta_activo === "true";
    }

    const tiposCabana = await tipoCabanaService.obtenerTiposCabana(filters);

    return res.status(200).json({
      ok: true,
      data: tiposCabana,
      total: tiposCabana.length,
    });
  } catch (error) {
    console.error("Error en listarTiposCabana:", error);
    return res.status(500).json({
      ok: false,
      error: "Error al obtener los tipos de cabaña",
    });
  }
};

/**
 * GET /api/tipo-cabana/:id
 * Obtener detalle de un tipo de cabaña específico
 */
export const obtenerTipoCabana = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un número
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        ok: false,
        error: "El ID del tipo de cabaña debe ser un número válido",
      });
    }

    const tipoCabana = await tipoCabanaService.obtenerTipoCabanaById(
      parseInt(id)
    );

    return res.status(200).json({
      ok: true,
      data: tipoCabana,
    });
  } catch (error) {
    console.error("Error en obtenerTipoCabana:", error);

    if (error.message === "Tipo de cabaña no encontrado") {
      return res.status(404).json({
        ok: false,
        error: "Tipo de cabaña no encontrado",
      });
    }

    return res.status(500).json({
      ok: false,
      error: "Error al obtener el tipo de cabaña",
    });
  }
};
