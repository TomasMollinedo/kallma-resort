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
    // Operador y Admin pueden cambiar id_est_op y estado de pago

    // Validar id_est_op si se proporciona
    if (data.id_est_op !== undefined) {
      if (
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

    // Validar esta_pagada si se proporciona
    if (data.esta_pagada !== undefined) {
      if (typeof data.esta_pagada !== "boolean") {
        errors.push({
          field: "esta_pagada",
          message: "El estado de pago debe ser un valor booleano",
        });
      }
    }

    // Validar monto_pagado si se proporciona
    if (data.monto_pagado !== undefined) {
      if (typeof data.monto_pagado !== "number" || data.monto_pagado < 0) {
        errors.push({
          field: "monto_pagado",
          message: "El monto pagado debe ser un número positivo o cero",
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
