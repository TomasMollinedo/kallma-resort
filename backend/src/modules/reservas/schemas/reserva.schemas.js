/**
 * Schemas de validación para el módulo de Reservas
 * Valida los datos de entrada para crear y actualizar reservas
 */

/**
 * Valida los datos para consultar disponibilidad
 * @param {Object} data - Datos de consulta de disponibilidad
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateDisponibilidad = (data) => {
  const errors = [];

  // Validar check_in (obligatorio)
  if (!data.check_in) {
    errors.push({
      field: "check_in",
      message: "La fecha de check-in es obligatoria",
    });
  } else {
    const checkIn = new Date(data.check_in);
    if (isNaN(checkIn.getTime())) {
      errors.push({
        field: "check_in",
        message: "La fecha de check-in no es válida. Use formato YYYY-MM-DD",
      });
    } else {
      // Verificar que check_in no sea antes de hoy (permite hoy)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(data.check_in + 'T00:00:00');
      
      if (checkInDate < today) {
        errors.push({
          field: "check_in",
          message: "La fecha de check-in no puede ser antes de hoy",
        });
      }
    }
  }

  // Validar check_out (obligatorio)
  if (!data.check_out) {
    errors.push({
      field: "check_out",
      message: "La fecha de check-out es obligatoria",
    });
  } else {
    const checkOut = new Date(data.check_out);
    if (isNaN(checkOut.getTime())) {
      errors.push({
        field: "check_out",
        message: "La fecha de check-out no es válida. Use formato YYYY-MM-DD",
      });
    }
  }

  // Validar que check_out sea posterior a check_in
  if (data.check_in && data.check_out) {
    const checkIn = new Date(data.check_in);
    const checkOut = new Date(data.check_out);
    
    if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
      if (checkOut <= checkIn) {
        errors.push({
          field: "check_out",
          message: "La fecha de check-out debe ser posterior a la fecha de check-in",
        });
      }
    }
  }

  // Validar cant_personas (obligatorio)
  if (!data.cant_personas) {
    errors.push({
      field: "cant_personas",
      message: "La cantidad de personas es obligatoria",
    });
  } else if (
    typeof data.cant_personas !== "number" ||
    !Number.isInteger(data.cant_personas) ||
    data.cant_personas <= 0
  ) {
    errors.push({
      field: "cant_personas",
      message: "La cantidad de personas debe ser un número entero positivo",
    });
  } else if (data.cant_personas > 10) {
    errors.push({
      field: "cant_personas",
      message: "El máximo de personas permitidas por reserva es 10",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida los datos para crear una nueva reserva
 * @param {Object} data - Datos de la reserva a validar
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateCrearReserva = (data) => {
  const errors = [];

  // Validar check_in (obligatorio)
  if (!data.check_in) {
    errors.push({
      field: "check_in",
      message: "La fecha de check-in es obligatoria",
    });
  } else {
    const checkIn = new Date(data.check_in);
    if (isNaN(checkIn.getTime())) {
      errors.push({
        field: "check_in",
        message: "La fecha de check-in no es válida. Use formato YYYY-MM-DD",
      });
    } else {
      // Verificar que check_in no sea antes de hoy (permite hoy)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(data.check_in + 'T00:00:00');
      
      if (checkInDate < today) {
        errors.push({
          field: "check_in",
          message: "La fecha de check-in no puede ser antes de hoy",
        });
      }
    }
  }

  // Validar check_out (obligatorio)
  if (!data.check_out) {
    errors.push({
      field: "check_out",
      message: "La fecha de check-out es obligatoria",
    });
  } else {
    const checkOut = new Date(data.check_out);
    if (isNaN(checkOut.getTime())) {
      errors.push({
        field: "check_out",
        message: "La fecha de check-out no es válida. Use formato YYYY-MM-DD",
      });
    }
  }

  // Validar que check_out sea posterior a check_in
  if (data.check_in && data.check_out) {
    const checkIn = new Date(data.check_in);
    const checkOut = new Date(data.check_out);
    
    if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
      if (checkOut <= checkIn) {
        errors.push({
          field: "check_out",
          message: "La fecha de check-out debe ser posterior a la fecha de check-in",
        });
      }
    }
  }

  // Validar cant_personas (obligatorio)
  if (!data.cant_personas) {
    errors.push({
      field: "cant_personas",
      message: "La cantidad de personas es obligatoria",
    });
  } else if (
    typeof data.cant_personas !== "number" ||
    !Number.isInteger(data.cant_personas) ||
    data.cant_personas <= 0
  ) {
    errors.push({
      field: "cant_personas",
      message: "La cantidad de personas debe ser un número entero positivo",
    });
  } else if (data.cant_personas > 10) {
    errors.push({
      field: "cant_personas",
      message: "El máximo de personas permitidas por reserva es 10",
    });
  }

  // Validar cabanas_ids (obligatorio, debe ser un array con al menos 1 cabaña)
  if (!data.cabanas_ids || !Array.isArray(data.cabanas_ids)) {
    errors.push({
      field: "cabanas_ids",
      message: "Debe proporcionar un array con los IDs de las cabañas a reservar",
    });
  } else if (data.cabanas_ids.length === 0) {
    errors.push({
      field: "cabanas_ids",
      message: "Debe seleccionar al menos una cabaña",
    });
  } else {
    // Validar que todos los IDs sean números enteros positivos
    const idsInvalidos = data.cabanas_ids.filter(
      (id) => typeof id !== "number" || !Number.isInteger(id) || id <= 0
    );
    if (idsInvalidos.length > 0) {
      errors.push({
        field: "cabanas_ids",
        message: "Todos los IDs de cabañas deben ser números enteros positivos",
      });
    }

    // Validar que no haya IDs duplicados
    const idsUnicos = new Set(data.cabanas_ids);
    if (idsUnicos.size !== data.cabanas_ids.length) {
      errors.push({
        field: "cabanas_ids",
        message: "No puede haber IDs de cabañas duplicados",
      });
    }
  }

  // Validar servicios_ids (opcional, si se proporciona debe ser array)
  if (data.servicios_ids !== undefined) {
    if (!Array.isArray(data.servicios_ids)) {
      errors.push({
        field: "servicios_ids",
        message: "Los servicios deben ser un array de IDs",
      });
    } else if (data.servicios_ids.length > 0) {
      // Validar que todos los IDs sean números enteros positivos
      const idsInvalidos = data.servicios_ids.filter(
        (id) => typeof id !== "number" || !Number.isInteger(id) || id <= 0
      );
      if (idsInvalidos.length > 0) {
        errors.push({
          field: "servicios_ids",
          message: "Todos los IDs de servicios deben ser números enteros positivos",
        });
      }

      // Validar que no haya IDs duplicados
      const idsUnicos = new Set(data.servicios_ids);
      if (idsUnicos.size !== data.servicios_ids.length) {
        errors.push({
          field: "servicios_ids",
          message: "No puede haber IDs de servicios duplicados",
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida los datos para actualizar el estado de una reserva
 * @param {Object} data - Datos del estado a actualizar
 * @param {string} rol - Rol del usuario (Cliente, Operador, Administrador)
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateActualizarEstado = (data, rol) => {
  const errors = [];

  // Validar que se proporcione al menos un campo
  if (Object.keys(data).length === 0) {
    errors.push({
      field: "general",
      message: "Debe proporcionar al menos un campo para actualizar",
    });
    return { isValid: false, errors };
  }

  // Si es Cliente, solo puede cambiar id_est_op a "Cancelada" (id 1)
  if (rol === "Cliente") {
    // Solo puede enviar id_est_op
    const camposPermitidos = ["id_est_op"];
    const camposEnviados = Object.keys(data);
    const camposNoPermitidos = camposEnviados.filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    if (camposNoPermitidos.length > 0) {
      errors.push({
        field: "general",
        message: `Los clientes solo pueden modificar el estado operativo. Campos no permitidos: ${camposNoPermitidos.join(", ")}`,
      });
    }

    // Validar id_est_op
    if (data.id_est_op === undefined) {
      errors.push({
        field: "id_est_op",
        message: "Debe proporcionar el estado operativo",
      });
    } else if (
      typeof data.id_est_op !== "number" ||
      !Number.isInteger(data.id_est_op)
    ) {
      errors.push({
        field: "id_est_op",
        message: "El estado operativo debe ser un número entero",
      });
    }
  } else if (rol === "Operador" || rol === "Administrador") {
    // Operador y Admin pueden cambiar únicamente el estado operativo

    const camposPermitidos = ["id_est_op"];
    const camposEnviados = Object.keys(data);
    const camposNoPermitidos = camposEnviados.filter(
      (campo) => !camposPermitidos.includes(campo)
    );

    if (camposNoPermitidos.length > 0) {
      errors.push({
        field: "general",
        message: `El estado financiero se gestiona desde Pagos. Campos no permitidos: ${camposNoPermitidos.join(", ")}`,
      });
    }

    // Validar id_est_op
    if (data.id_est_op === undefined) {
      errors.push({
        field: "id_est_op",
        message: "Debe proporcionar el estado operativo",
      });
    } else if (
      typeof data.id_est_op !== "number" ||
      !Number.isInteger(data.id_est_op) ||
      data.id_est_op <= 0
    ) {
      errors.push({
        field: "id_est_op",
        message: "El estado operativo debe ser un ID válido",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

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
 * Valida los filtros de búsqueda para clientes
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateFiltrosReservasCliente = (filters) => {
  const errors = [];

  // Validar id_est_op (opcional)
  if (filters.id_est_op !== undefined) {
    const idEstOp = parseInt(filters.id_est_op);
    if (isNaN(idEstOp) || idEstOp <= 0) {
      errors.push({
        field: "id_est_op",
        message: "El ID de estado operativo debe ser un número entero positivo",
      });
    }
  }

  // Validar esta_pagada (opcional)
  if (filters.esta_pagada !== undefined) {
    if (filters.esta_pagada !== "true" && filters.esta_pagada !== "false") {
      errors.push({
        field: "esta_pagada",
        message: "El estado de pago debe ser 'true' o 'false'",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida los filtros de búsqueda para staff (Operador/Admin)
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateFiltrosReservasStaff = (filters) => {
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
  if (filters.fecha_desde && filters.fecha_hasta && esFechaValida(filters.fecha_desde) && esFechaValida(filters.fecha_hasta)) {
    const desde = new Date(filters.fecha_desde + 'T00:00:00');
    const hasta = new Date(filters.fecha_hasta + 'T00:00:00');
    
    if (hasta <= desde) {
      errors.push({
        field: "fecha_hasta",
        message: "La fecha hasta debe ser posterior a la fecha desde",
      });
    }
  }

  // Validar arrivals_on (opcional)
  if (filters.arrivals_on !== undefined) {
    if (!esFechaValida(filters.arrivals_on)) {
      errors.push({
        field: "arrivals_on",
        message: "La fecha de llegadas no es válida. Use formato YYYY-MM-DD",
      });
    }
  }

  // Validar departures_on (opcional)
  if (filters.departures_on !== undefined) {
    if (!esFechaValida(filters.departures_on)) {
      errors.push({
        field: "departures_on",
        message: "La fecha de salidas no es válida. Use formato YYYY-MM-DD",
      });
    }
  }

  // Validar inhouse_on (opcional)
  if (filters.inhouse_on !== undefined) {
    if (!esFechaValida(filters.inhouse_on)) {
      errors.push({
        field: "inhouse_on",
        message: "La fecha de hospedados no es válida. Use formato YYYY-MM-DD",
      });
    }
  }

  // Validar que no se usen filtros mutuamente exclusivos
  const presetsUsados = [filters.arrivals_on, filters.departures_on, filters.inhouse_on].filter(Boolean);
  const ventanaUsada = filters.fecha_desde || filters.fecha_hasta;
  
  if (presetsUsados.length > 0 && ventanaUsada) {
    errors.push({
      field: "general",
      message: "No puede usar filtros de fecha específica (arrivals_on, departures_on, inhouse_on) junto con filtros de ventana de fechas (fecha_desde, fecha_hasta)",
    });
  }

  if (presetsUsados.length > 1) {
    errors.push({
      field: "general",
      message: "Solo puede usar uno de los siguientes filtros a la vez: arrivals_on, departures_on, inhouse_on",
    });
  }

  // Validar id_est_op (opcional)
  if (filters.id_est_op !== undefined) {
    const idEstOp = parseInt(filters.id_est_op);
    if (isNaN(idEstOp) || idEstOp <= 0) {
      errors.push({
        field: "id_est_op",
        message: "El ID de estado operativo debe ser un número entero positivo",
      });
    }
  }

  // Validar esta_pagada (opcional)
  if (filters.esta_pagada !== undefined) {
    if (filters.esta_pagada !== "true" && filters.esta_pagada !== "false") {
      errors.push({
        field: "esta_pagada",
        message: "El estado de pago debe ser 'true' o 'false'",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
