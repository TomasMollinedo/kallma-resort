/**
 * Utilidades de validación reutilizables
 */

/**
 * Valida la longitud de un término de búsqueda
 * @param {string} term - Término a validar
 * @param {number} maxLength - Longitud máxima permitida (default: 100)
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateSearchLength = (term, maxLength = 100) => {
  if (!term) {
    return { isValid: true, error: null };
  }

  const trimmedTerm = term.trim();
  
  if (trimmedTerm.length > maxLength) {
    return {
      isValid: false,
      error: `El término de búsqueda no puede exceder ${maxLength} caracteres`
    };
  }

  return { isValid: true, error: null };
};
