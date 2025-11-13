/**
 * Schemas de validación para el módulo de Cabañas
 * Valida los datos de entrada para crear y actualizar cabañas
 */

/**
 * Valida los datos para crear una nueva cabaña
 * @param {Object} data - Datos de la cabaña a validar
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateCreateCabana = (data) => {
  const errors = [];

  // Validar cod_cabana (obligatorio)
  if (!data.cod_cabana || typeof data.cod_cabana !== "string") {
    errors.push({
      field: "cod_cabana",
      message: "El código de la cabaña es obligatorio y debe ser un texto",
    });
  } else if (data.cod_cabana.trim().length === 0) {
    errors.push({
      field: "cod_cabana",
      message: "El código de la cabaña no puede estar vacío",
    });
  } else if (data.cod_cabana.length > 50) {
    errors.push({
      field: "cod_cabana",
      message: "El código de la cabaña no puede exceder 50 caracteres",
    });
  }

  // Validar id_tipo_cab (obligatorio)
  if (!data.id_tipo_cab) {
    errors.push({
      field: "id_tipo_cab",
      message: "El tipo de cabaña es obligatorio",
    });
  } else if (
    typeof data.id_tipo_cab !== "number" ||
    !Number.isInteger(data.id_tipo_cab) ||
    data.id_tipo_cab <= 0
  ) {
    errors.push({
      field: "id_tipo_cab",
      message: "El tipo de cabaña debe ser un ID válido",
    });
  }

  // Validar id_zona (obligatorio)
  if (!data.id_zona) {
    errors.push({
      field: "id_zona",
      message: "La zona es obligatoria",
    });
  } else if (
    typeof data.id_zona !== "number" ||
    !Number.isInteger(data.id_zona) ||
    data.id_zona <= 0
  ) {
    errors.push({
      field: "id_zona",
      message: "La zona debe ser un ID válido",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida los datos para actualizar una cabaña (Admin)
 * Puede actualizar cualquier campo
 * @param {Object} data - Datos de la cabaña a validar
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateUpdateCabanaAdmin = (data) => {
  const errors = [];

  // Si no hay campos para actualizar
  if (Object.keys(data).length === 0) {
    errors.push({
      field: "general",
      message: "Debe proporcionar al menos un campo para actualizar",
    });
    return { isValid: false, errors };
  }

  // Validar cod_cabana si se proporciona
  if (data.cod_cabana !== undefined) {
    if (typeof data.cod_cabana !== "string") {
      errors.push({
        field: "cod_cabana",
        message: "El código de la cabaña debe ser un texto",
      });
    } else if (data.cod_cabana.trim().length === 0) {
      errors.push({
        field: "cod_cabana",
        message: "El código de la cabaña no puede estar vacío",
      });
    } else if (data.cod_cabana.length > 50) {
      errors.push({
        field: "cod_cabana",
        message: "El código de la cabaña no puede exceder 50 caracteres",
      });
    }
  }

  // Validar id_tipo_cab si se proporciona
  if (data.id_tipo_cab !== undefined) {
    if (
      typeof data.id_tipo_cab !== "number" ||
      !Number.isInteger(data.id_tipo_cab) ||
      data.id_tipo_cab <= 0
    ) {
      errors.push({
        field: "id_tipo_cab",
        message: "El tipo de cabaña debe ser un ID válido",
      });
    }
  }

  // Validar esta_activo si se proporciona
  if (data.esta_activo !== undefined) {
    if (typeof data.esta_activo !== "boolean") {
      errors.push({
        field: "esta_activo",
        message: "El estado activo debe ser un valor booleano",
      });
    } else if (data.esta_activo === false) {
      errors.push({
        field: "esta_activo",
        message:
          "No puede desactivar la cabaña desde este endpoint. Use DELETE /api/cabanas/:id",
      });
    }
  }

  // Validar en_mantenimiento si se proporciona
  if (data.en_mantenimiento !== undefined) {
    if (typeof data.en_mantenimiento !== "boolean") {
      errors.push({
        field: "en_mantenimiento",
        message: "El estado de mantenimiento debe ser un valor booleano",
      });
    }
  }

  // Validar id_zona si se proporciona
  if (data.id_zona !== undefined) {
    if (
      typeof data.id_zona !== "number" ||
      !Number.isInteger(data.id_zona) ||
      data.id_zona <= 0
    ) {
      errors.push({
        field: "id_zona",
        message: "La zona debe ser un ID válido",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida los datos para actualizar mantenimiento de cabaña (Operador y Admin)
 * Solo puede cambiar el campo en_mantenimiento
 * @param {Object} data - Datos de la cabaña a validar
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateUpdateMantenimientoCabana = (data) => {
  const errors = [];

  // El operador solo puede cambiar el mantenimiento
  if (data.en_mantenimiento === undefined) {
    errors.push({
      field: "en_mantenimiento",
      message: "Debe proporcionar el estado de mantenimiento",
    });
    return { isValid: false, errors };
  }

  if (typeof data.en_mantenimiento !== "boolean") {
    errors.push({
      field: "en_mantenimiento",
      message: "El estado de mantenimiento debe ser un valor booleano (true o false)",
    });
    return { isValid: false, errors };
  }

  // Verificar que no se envíen otros campos
  const camposPermitidos = ["en_mantenimiento"];
  const camposEnviados = Object.keys(data);
  const camposNoPermitidos = camposEnviados.filter(
    (campo) => !camposPermitidos.includes(campo)
  );

  if (camposNoPermitidos.length > 0) {
    errors.push({
      field: "general",
      message: `No tiene permisos para modificar los siguientes campos: ${camposNoPermitidos.join(", ")}`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
