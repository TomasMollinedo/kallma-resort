/**
 * Schemas de validación para autenticación
 * Define las reglas de validación para los DTOs
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida los datos de registro
 */
export const validateRegisterData = (data) => {
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
 * Valida los datos de login
 */
export const validateLoginData = (data) => {
  const errors = [];

  if (!data.email) {
    errors.push({ field: "email", message: "Email es obligatorio" });
  }

  if (!data.password) {
    errors.push({ field: "password", message: "Password es obligatorio" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
