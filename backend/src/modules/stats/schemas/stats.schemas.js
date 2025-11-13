/**
 * Esquemas y validaciones ligeras para los endpoints del módulo de estadísticas.
 * Cada validador retorna `{ isValid, errors, params }` según el patrón del proyecto.
 */

/**
 * Normaliza la fecha recibida (string o Date) al formato YYYY-MM-DD.
 * @param {string|Date} value - Fecha a normalizar.
 * @returns {string|null} Fecha en formato ISO corto o null si no es válida.
 */
const normalizarFecha = (value) => {
  const fecha = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(fecha.getTime())) {
    return null;
  }
  const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
};

/**
 * Valida los parámetros permitidos para `/api/stats/admin-dashboard`.
 * El endpoint no admite query params; siempre devuelve 12 meses.
 * @param {Record<string, any>} query - Query params recibidos.
 * @returns {{ isValid: boolean, errors: Array<{ field: string, message: string }>, params: { monthsBack: number } }}
 */
export const validateAdminDashboardParams = (query = {}) => {
  const errors = [];
  const params = {
    monthsBack: 12,
  };

  if (Object.keys(query).length > 0) {
    Object.keys(query).forEach((key) => {
      errors.push({
        field: key,
        message: "Este endpoint no acepta parámetros de consulta.",
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    params,
  };
};

/**
 * Valida los parámetros para `/api/stats/operator-dashboard`.
 * Admite `referenceDate` (YYYY-MM-DD) para auditorías; por defecto usa la fecha actual.
 * @param {Record<string, any>} query - Query params recibidos.
 * @returns {{ isValid: boolean, errors: Array<{ field: string, message: string }>, params: { referenceDate: string|null } }}
 */
export const validateOperatorDashboardParams = (query = {}) => {
  const errors = [];
  const params = {
    referenceDate: null,
  };

  const allowedFields = ["referenceDate"];
  Object.keys(query).forEach((key) => {
    if (!allowedFields.includes(key)) {
      errors.push({
        field: key,
        message: "Este parámetro no está soportado por el endpoint.",
      });
    }
  });

  if (query.referenceDate !== undefined) {
    const fechaNormalizada = normalizarFecha(query.referenceDate);

    if (!fechaNormalizada) {
      errors.push({
        field: "referenceDate",
        message: "Debe tener formato YYYY-MM-DD válido.",
      });
    } else {
      params.referenceDate = fechaNormalizada;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    params,
  };
};
