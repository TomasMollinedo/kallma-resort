/**
 * Schemas de validación para el módulo de Zonas
 * Valida los datos de entrada para crear y actualizar zonas
 */

/**
 * Valida los datos para crear una nueva zona
 * @param {Object} data - Datos de la zona a validar
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateCreateZona = (data) => {
  const errors = [];

  // Validar nom_zona (obligatorio)
  if (!data.nom_zona || typeof data.nom_zona !== "string") {
    errors.push({
      field: "nom_zona",
      message: "El nombre de la zona es obligatorio y debe ser un texto",
    });
  } else if (data.nom_zona.trim().length === 0) {
    errors.push({
      field: "nom_zona",
      message: "El nombre de la zona no puede estar vacío",
    });
  } else if (data.nom_zona.length > 200) {
    errors.push({
      field: "nom_zona",
      message: "El nombre de la zona no puede exceder 200 caracteres",
    });
  }

  // Validar capacidad_cabanas (obligatorio, debe ser >= 0)
  if (data.capacidad_cabanas === undefined || data.capacidad_cabanas === null) {
    errors.push({
      field: "capacidad_cabanas",
      message: "La capacidad de cabañas es obligatoria",
    });
  } else if (
    typeof data.capacidad_cabanas !== "number" ||
    !Number.isInteger(data.capacidad_cabanas)
  ) {
    errors.push({
      field: "capacidad_cabanas",
      message: "La capacidad de cabañas debe ser un número entero",
    });
  } else if (data.capacidad_cabanas < 0) {
    errors.push({
      field: "capacidad_cabanas",
      message: "La capacidad de cabañas no puede ser negativa",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida los datos para actualizar una zona existente
 * Todos los campos son opcionales, pero si se envían deben ser válidos
 * @param {Object} data - Datos de la zona a validar
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateUpdateZona = (data) => {
  const errors = [];

  // Si no hay campos para actualizar
  if (Object.keys(data).length === 0) {
    errors.push({
      field: "general",
      message: "Debe proporcionar al menos un campo para actualizar",
    });
    return { isValid: false, errors };
  }

  // Validar nom_zona si se proporciona
  if (data.nom_zona !== undefined) {
    if (typeof data.nom_zona !== "string") {
      errors.push({
        field: "nom_zona",
        message: "El nombre de la zona debe ser un texto",
      });
    } else if (data.nom_zona.trim().length === 0) {
      errors.push({
        field: "nom_zona",
        message: "El nombre de la zona no puede estar vacío",
      });
    } else if (data.nom_zona.length > 200) {
      errors.push({
        field: "nom_zona",
        message: "El nombre de la zona no puede exceder 200 caracteres",
      });
    }
  }

  // Validar capacidad_cabanas si se proporciona
  if (data.capacidad_cabanas !== undefined) {
    if (
      typeof data.capacidad_cabanas !== "number" ||
      !Number.isInteger(data.capacidad_cabanas)
    ) {
      errors.push({
        field: "capacidad_cabanas",
        message: "La capacidad de cabañas debe ser un número entero",
      });
    } else if (data.capacidad_cabanas < 0) {
      errors.push({
        field: "capacidad_cabanas",
        message: "La capacidad de cabañas no puede ser negativa",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
