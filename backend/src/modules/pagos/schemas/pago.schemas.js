/**
 * Schemas de validación para el módulo de Pagos
 * Valida los datos de entrada para crear pagos y filtros de búsqueda
 */

/**
 * Valida una fecha en formato YYYY-MM-DD
 * @param {string} fecha - Fecha a validar
 * @returns {boolean} true si es válida
 */
const esFechaValida = (fecha) => {
  if (typeof fecha !== "string") return false;
  
  // Validar formato YYYY-MM-DD con regex
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(fecha)) return false;
  
  // Validar que sea una fecha real
  const date = new Date(fecha + 'T00:00:00');
  return !isNaN(date.getTime());
};

/**
 * Valida los datos para crear un nuevo pago
 * @param {Object} data - Datos del pago a validar
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateCrearPago = (data) => {
  const errors = [];

  // Validar monto (obligatorio)
  if (data.monto === undefined || data.monto === null) {
    errors.push({
      field: "monto",
      message: "El monto es obligatorio",
    });
  } else if (typeof data.monto !== "number" || data.monto <= 0) {
    errors.push({
      field: "monto",
      message: "El monto debe ser un número mayor a cero",
    });
  }

  // Validar id_medio_pago (obligatorio)
  if (!data.id_medio_pago) {
    errors.push({
      field: "id_medio_pago",
      message: "El método de pago es obligatorio",
    });
  } else if (
    typeof data.id_medio_pago !== "number" ||
    !Number.isInteger(data.id_medio_pago) ||
    data.id_medio_pago <= 0
  ) {
    errors.push({
      field: "id_medio_pago",
      message: "El método de pago debe ser un ID válido",
    });
  } else if (![1, 2, 3].includes(data.id_medio_pago)) {
    errors.push({
      field: "id_medio_pago",
      message: "El método de pago debe ser: 1=Efectivo, 2=Tarjeta de débito, 3=Tarjeta de crédito",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida los filtros de búsqueda para listar pagos
 * Usado tanto por clientes (filtrado automático a sus reservas) como por staff (todos los pagos)
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateFiltrosPagos = (filters) => {
  const errors = [];

  // Validar cod_reserva (opcional)
  if (filters.cod_reserva !== undefined) {
    if (typeof filters.cod_reserva !== "string" || filters.cod_reserva.trim() === "") {
      errors.push({
        field: "cod_reserva",
        message: "El código de reserva debe ser una cadena de texto no vacía",
      });
    } else if (filters.cod_reserva.length > 50) {
      errors.push({
        field: "cod_reserva",
        message: "El código de reserva no puede exceder 50 caracteres",
      });
    }
  }

  // Validar fecha_desde (opcional)
  if (filters.fecha_desde !== undefined) {
    if (!esFechaValida(filters.fecha_desde)) {
      errors.push({
        field: "fecha_desde",
        message: "La fecha desde no es válida. Use formato YYYY-MM-DD",
      });
    }
  }

  // Validar fecha_hasta (opcional)
  if (filters.fecha_hasta !== undefined) {
    if (!esFechaValida(filters.fecha_hasta)) {
      errors.push({
        field: "fecha_hasta",
        message: "La fecha hasta no es válida. Use formato YYYY-MM-DD",
      });
    }
  }

  // Validar que fecha_hasta sea posterior a fecha_desde si ambos están presentes
  if (
    filters.fecha_desde &&
    filters.fecha_hasta &&
    esFechaValida(filters.fecha_desde) &&
    esFechaValida(filters.fecha_hasta)
  ) {
    const desde = new Date(filters.fecha_desde + 'T00:00:00');
    const hasta = new Date(filters.fecha_hasta + 'T00:00:00');
    
    if (hasta < desde) {
      errors.push({
        field: "fecha_hasta",
        message: "La fecha hasta debe ser posterior o igual a la fecha desde",
      });
    }
  }

  // Validar esta_activo (opcional)
  if (filters.esta_activo !== undefined) {
    if (filters.esta_activo !== "true" && filters.esta_activo !== "false") {
      errors.push({
        field: "esta_activo",
        message: "El estado activo debe ser 'true' o 'false'",
      });
    }
  }

  // Validar id_medio_pago (opcional)
  if (filters.id_medio_pago !== undefined) {
    const idMedioPago = parseInt(filters.id_medio_pago);
    if (isNaN(idMedioPago) || idMedioPago <= 0) {
      errors.push({
        field: "id_medio_pago",
        message: "El ID de método de pago debe ser un número entero positivo",
      });
    } else if (![1, 2, 3].includes(idMedioPago)) {
      errors.push({
        field: "id_medio_pago",
        message: "El método de pago debe ser: 1=Efectivo, 2=Tarjeta de débito, 3=Tarjeta de crédito",
      });
    }
  }

  // Validar limit (opcional)
  if (filters.limit !== undefined) {
    const limit = parseInt(filters.limit);
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      errors.push({
        field: "limit",
        message: "El límite debe estar entre 1 y 1000",
      });
    }
  }

  // Validar offset (opcional)
  if (filters.offset !== undefined) {
    const offset = parseInt(filters.offset);
    if (isNaN(offset) || offset < 0) {
      errors.push({
        field: "offset",
        message: "El offset debe ser un número mayor o igual a cero",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
