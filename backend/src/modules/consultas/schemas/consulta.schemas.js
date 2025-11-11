/**
 * Schemas de validación para el módulo de Consultas
 * Valida los datos de entrada para crear y responder consultas
 */

/**
 * Expresión regular para validar emails según RFC 5322
 */
const regexEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Valida los datos para crear una nueva consulta desde el formulario público.
 * @param {Object} data - Datos de la consulta a validar
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateCrearConsulta = (data) => {
  const errors = [];

  // Validar nom_cli (obligatorio)
  if (!data.nomCli || typeof data.nomCli !== "string") {
    errors.push({
      field: "nomCli",
      message: "El nombre es obligatorio",
    });
  } else {
    const nombreTrim = data.nomCli.trim();
    
    if (nombreTrim.length === 0) {
      errors.push({
        field: "nomCli",
        message: "El nombre no puede estar vacío",
      });
    } else if (nombreTrim.length < 2) {
      errors.push({
        field: "nomCli",
        message: "El nombre debe tener al menos 2 caracteres",
      });
    } else if (nombreTrim.length > 200) {
      errors.push({
        field: "nomCli",
        message: "El nombre no puede exceder 200 caracteres",
      });
    }
  }

  // Validar email_cli (obligatorio)
  if (!data.emailCli || typeof data.emailCli !== "string") {
    errors.push({
      field: "emailCli",
      message: "El email es obligatorio",
    });
  } else {
    const emailTrim = data.emailCli.trim();
    
    if (emailTrim.length === 0) {
      errors.push({
        field: "emailCli",
        message: "El email no puede estar vacío",
      });
    } else if (!regexEmail.test(emailTrim)) {
      errors.push({
        field: "emailCli",
        message: "El email no tiene un formato válido",
      });
    } else if (emailTrim.length > 320) {
      errors.push({
        field: "emailCli",
        message: "El email no puede exceder 320 caracteres",
      });
    }
  }

  // Validar titulo (opcional)
  if (data.titulo !== undefined && data.titulo !== null) {
    if (typeof data.titulo !== "string") {
      errors.push({
        field: "titulo",
        message: "El título debe ser una cadena de texto",
      });
    } else {
      const tituloTrim = data.titulo.trim();
      
      if (tituloTrim.length > 250) {
        errors.push({
          field: "titulo",
          message: "El título no puede exceder 250 caracteres",
        });
      }
    }
  }

  // Validar mensaje_cli (obligatorio)
  if (!data.mensajeCli || typeof data.mensajeCli !== "string") {
    errors.push({
      field: "mensajeCli",
      message: "El mensaje es obligatorio",
    });
  } else {
    const mensajeTrim = data.mensajeCli.trim();
    
    if (mensajeTrim.length === 0) {
      errors.push({
        field: "mensajeCli",
        message: "El mensaje no puede estar vacío",
      });
    } else if (mensajeTrim.length < 10) {
      errors.push({
        field: "mensajeCli",
        message: "El mensaje debe tener al menos 10 caracteres",
      });
    } else if (mensajeTrim.length > 5000) {
      errors.push({
        field: "mensajeCli",
        message: "El mensaje no puede exceder 5000 caracteres",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida los filtros de búsqueda para listar consultas.
 * @param {Object} filtros - Filtros de búsqueda
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateFiltrosConsultas = (filtros) => {
  const errors = [];

  // Validar esta_respondida (opcional, debe ser boolean string)
  if (filtros.estaRespondida !== undefined) {
    if (filtros.estaRespondida !== "true" && filtros.estaRespondida !== "false") {
      errors.push({
        field: "estaRespondida",
        message: "El filtro estaRespondida debe ser 'true' o 'false'",
      });
    }
  }

  // Validar período (opcional, por defecto "todo")
  if (filtros.periodo !== undefined) {
    const periodosValidos = ["hoy", "semana", "mes", "todo"];
    if (!periodosValidos.includes(filtros.periodo)) {
      errors.push({
        field: "periodo",
        message: "El período debe ser uno de: hoy, semana, mes, todo",
      });
    }
  }

  // Validar busqueda (opcional)
  if (filtros.busqueda !== undefined) {
    if (typeof filtros.busqueda !== "string") {
      errors.push({
        field: "busqueda",
        message: "El término de búsqueda debe ser una cadena de texto",
      });
    } else if (filtros.busqueda.trim().length === 0) {
      errors.push({
        field: "busqueda",
        message: "El término de búsqueda no puede estar vacío",
      });
    } else if (filtros.busqueda.length > 200) {
      errors.push({
        field: "busqueda",
        message: "El término de búsqueda no puede exceder 200 caracteres",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida los datos para responder una consulta.
 * @param {Object} data - Datos de la respuesta a validar
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateResponderConsulta = (data) => {
  const errors = [];

  // Validar respuesta_op (obligatorio)
  if (!data.respuestaOp || typeof data.respuestaOp !== "string") {
    errors.push({
      field: "respuestaOp",
      message: "La respuesta es obligatoria",
    });
  } else {
    const respuestaTrim = data.respuestaOp.trim();
    
    if (respuestaTrim.length === 0) {
      errors.push({
        field: "respuestaOp",
        message: "La respuesta no puede estar vacía",
      });
    } else if (respuestaTrim.length < 10) {
      errors.push({
        field: "respuestaOp",
        message: "La respuesta debe tener al menos 10 caracteres",
      });
    } else if (respuestaTrim.length > 5000) {
      errors.push({
        field: "respuestaOp",
        message: "La respuesta no puede exceder 5000 caracteres",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
