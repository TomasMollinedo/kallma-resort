/**
 * Schemas de validación para usuarios
 * Define las reglas de validación para gestión de usuarios
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida los datos de creación de usuario (Admin)
 */
export const validateCreateUserData = (data) => {
  const errors = [];

  // Email obligatorio
  if (!data.email) {
    errors.push({ field: "email", message: "Email es obligatorio" });
  } else if (!emailRegex.test(data.email)) {
    errors.push({ field: "email", message: "Formato de email inválido" });
  }

  // Password obligatorio
  if (!data.password) {
    errors.push({ field: "password", message: "Password es obligatorio" });
  } else if (data.password.length < 6) {
    errors.push({ field: "password", message: "La contraseña debe tener al menos 6 caracteres" });
  }

  // Nombre obligatorio
  if (!data.nombre) {
    errors.push({ field: "nombre", message: "Nombre es obligatorio" });
  } else if (data.nombre.trim().length < 2) {
    errors.push({ field: "nombre", message: "El nombre debe tener al menos 2 caracteres" });
  }

  // Rol obligatorio
  if (!data.id_rol_usuario) {
    errors.push({ field: "id_rol_usuario", message: "ID de rol es obligatorio" });
  } else if (!Number.isInteger(data.id_rol_usuario) || data.id_rol_usuario < 1) {
    errors.push({ field: "id_rol_usuario", message: "ID de rol inválido" });
  }

  // Validaciones opcionales
  if (data.telefono && data.telefono.length > 50) {
    errors.push({ field: "telefono", message: "El teléfono no puede exceder 50 caracteres" });
  }

  if (data.dni && data.dni.length > 50) {
    errors.push({ field: "dni", message: "El DNI no puede exceder 50 caracteres" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida los datos de actualización de usuario
 */
export const validateUpdateUserData = (data) => {
  const errors = [];

  // Validar email si se proporciona
  if (data.email !== undefined) {
    if (data.email === "") {
      errors.push({ field: "email", message: "Email no puede estar vacío" });
    } else if (!emailRegex.test(data.email)) {
      errors.push({ field: "email", message: "Formato de email inválido" });
    }
  }

  // Validar password si se proporciona
  if (data.password !== undefined) {
    if (data.password === "") {
      errors.push({ field: "password", message: "Password no puede estar vacío" });
    } else if (data.password.length < 6) {
      errors.push({ field: "password", message: "La contraseña debe tener al menos 6 caracteres" });
    }
  }

  // Validar nombre si se proporciona
  if (data.nombre !== undefined) {
    if (data.nombre === "" || data.nombre.trim().length < 2) {
      errors.push({ field: "nombre", message: "El nombre debe tener al menos 2 caracteres" });
    }
  }

  // Validar rol si se proporciona
  if (data.id_rol_usuario !== undefined) {
    if (!Number.isInteger(data.id_rol_usuario) || data.id_rol_usuario < 1) {
      errors.push({ field: "id_rol_usuario", message: "ID de rol inválido" });
    }
  }

    // Validaciones opcionales
  if (data.telefono && data.telefono.length > 50) {
    errors.push({ field: "telefono", message: "El teléfono no puede exceder 50 caracteres" });
  }

  if (data.dni && data.dni.length > 50) {
    errors.push({ field: "dni", message: "El DNI no puede exceder 50 caracteres" });
  }

  // Validar estado activo si se proporciona
  if (data.esta_activo !== undefined) {
    if (typeof data.esta_activo !== "boolean") {
      errors.push({ field: "esta_activo", message: "El campo esta_activo debe ser booleano" });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valida filtros de listado de usuarios
 * Incluye búsqueda por nombre, email y DNI
 */
export const validateUserFilters = (filters) => {
  const errors = [];
  const validRoles = ["Cliente", "Operador", "Administrador"];

  // Validar rol
  if (filters.rol && !validRoles.includes(filters.rol)) {
    errors.push({ field: "rol", message: `Rol debe ser uno de: ${validRoles.join(", ")}` });
  }

  // Validar estado activo
  if (filters.esta_activo !== undefined) {
    const value = filters.esta_activo;
    if (value !== "true" && value !== "false" && value !== true && value !== false) {
      errors.push({ field: "esta_activo", message: "El campo esta_activo debe ser true o false" });
    }
  }

  // Validar búsqueda por nombre (opcional)
  if (filters.nombre !== undefined) {
    if (typeof filters.nombre !== "string") {
      errors.push({ field: "nombre", message: "El nombre debe ser un texto" });
    } else if (filters.nombre.length > 200) {
      errors.push({ field: "nombre", message: "El nombre no puede exceder 200 caracteres" });
    }
  }

  // Validar búsqueda por email (opcional)
  if (filters.email !== undefined) {
    if (typeof filters.email !== "string") {
      errors.push({ field: "email", message: "El email debe ser un texto" });
    } else if (filters.email.length > 320) {
      errors.push({ field: "email", message: "El email no puede exceder 320 caracteres" });
    }
  }

  // Validar búsqueda por DNI (opcional)
  if (filters.dni !== undefined) {
    if (typeof filters.dni !== "string") {
      errors.push({ field: "dni", message: "El DNI debe ser un texto" });
    } else if (filters.dni.length > 50) {
      errors.push({ field: "dni", message: "El DNI no puede exceder 50 caracteres" });
    }
  }

  // Validar paginación
  if (filters.limit !== undefined) {
    const limit = parseInt(filters.limit);
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      errors.push({ field: "limit", message: "Limit debe ser un número entre 1 y 1000" });
    }
  }

  if (filters.offset !== undefined) {
    const offset = parseInt(filters.offset);
    if (isNaN(offset) || offset < 0) {
      errors.push({ field: "offset", message: "Offset debe ser un número >= 0" });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
