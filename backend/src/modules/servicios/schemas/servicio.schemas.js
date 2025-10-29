/**
 * Schemas de validación para el módulo de Servicios
 * Valida los datos de entrada para crear y actualizar servicios
 */

/**
 * Valida los datos para crear un nuevo servicio
 * @param {Object} data - Datos del servicio a validar
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateCreateServicio = (data) => {
  const errors = [];

  // Validar nom_servicio (obligatorio)
  if (!data.nom_servicio || typeof data.nom_servicio !== "string") {
    errors.push({
      field: "nom_servicio",
      message: "El nombre del servicio es obligatorio y debe ser un texto",
    });
  } else if (data.nom_servicio.trim().length === 0) {
    errors.push({
      field: "nom_servicio",
      message: "El nombre del servicio no puede estar vacío",
    });
  } else if (data.nom_servicio.length > 200) {
    errors.push({
      field: "nom_servicio",
      message: "El nombre del servicio no puede exceder 200 caracteres",
    });
  }

  // Validar precio_servicio (obligatorio, debe ser >= 0)
  if (data.precio_servicio === undefined || data.precio_servicio === null) {
    errors.push({
      field: "precio_servicio",
      message: "El precio del servicio es obligatorio",
    });
  } else if (typeof data.precio_servicio !== "number") {
    errors.push({
      field: "precio_servicio",
      message: "El precio del servicio debe ser un número",
    });
  } else if (data.precio_servicio < 0) {
    errors.push({
      field: "precio_servicio",
      message: "El precio del servicio no puede ser negativo",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida los datos para actualizar un servicio existente
 * Todos los campos son opcionales, pero si se envían deben ser válidos
 * @param {Object} data - Datos del servicio a validar
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateUpdateServicio = (data) => {
  const errors = [];

  // Si no hay campos para actualizar
  if (Object.keys(data).length === 0) {
    errors.push({
      field: "general",
      message: "Debe proporcionar al menos un campo para actualizar",
    });
    return { isValid: false, errors };
  }

  // Validar nom_servicio si se proporciona
  if (data.nom_servicio !== undefined) {
    if (typeof data.nom_servicio !== "string") {
      errors.push({
        field: "nom_servicio",
        message: "El nombre del servicio debe ser un texto",
      });
    } else if (data.nom_servicio.trim().length === 0) {
      errors.push({
        field: "nom_servicio",
        message: "El nombre del servicio no puede estar vacío",
      });
    } else if (data.nom_servicio.length > 200) {
      errors.push({
        field: "nom_servicio",
        message: "El nombre del servicio no puede exceder 200 caracteres",
      });
    }
  }

  // Validar precio_servicio si se proporciona
  if (data.precio_servicio !== undefined) {
    if (typeof data.precio_servicio !== "number") {
      errors.push({
        field: "precio_servicio",
        message: "El precio del servicio debe ser un número",
      });
    } else if (data.precio_servicio < 0) {
      errors.push({
        field: "precio_servicio",
        message: "El precio del servicio no puede ser negativo",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
