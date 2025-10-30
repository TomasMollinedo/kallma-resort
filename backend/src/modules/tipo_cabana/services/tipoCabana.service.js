/**
 * Servicios de lógica de negocio para el módulo de Tipos de Cabaña
 * Maneja todas las operaciones de consulta
 */

import { pool } from "../../../config/database.js";

/**
 * Obtener todos los tipos de cabaña con filtros opcionales
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} Lista de tipos de cabaña
 */
export const obtenerTiposCabana = async (filters = {}) => {
  try {
    let query = `
      SELECT 
        id_tipo_cab,
        nom_tipo_cab,
        capacidad,
        precio_noche,
        esta_activo
      FROM tipo_cabana
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Filtrar por estado activo si se especifica
    if (filters.esta_activo !== undefined) {
      query += ` AND esta_activo = $${paramCount}`;
      params.push(filters.esta_activo);
      paramCount++;
    }

    query += ` ORDER BY nom_tipo_cab ASC`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Error en obtenerTiposCabana:", error);
    throw new Error("Error al obtener la lista de tipos de cabaña");
  }
};

/**
 * Obtener un tipo de cabaña por ID
 * @param {number} id - ID del tipo de cabaña
 * @returns {Promise<Object>} Tipo de cabaña encontrado
 */
export const obtenerTipoCabanaById = async (id) => {
  try {
    const query = `
      SELECT 
        tc.id_tipo_cab,
        tc.nom_tipo_cab,
        tc.capacidad,
        tc.precio_noche,
        tc.esta_activo,
        COUNT(c.id_cabana) FILTER (WHERE c.esta_activo = TRUE) as total_cabanas_activas
      FROM tipo_cabana tc
      LEFT JOIN cabana c ON tc.id_tipo_cab = c.id_tipo_cab
      WHERE tc.id_tipo_cab = $1
      GROUP BY tc.id_tipo_cab
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error("Tipo de cabaña no encontrado");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error en obtenerTipoCabanaById:", error);
    throw error;
  }
};
