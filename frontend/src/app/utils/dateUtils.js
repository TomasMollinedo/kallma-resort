/**
 * Convierte una cadena ISO en una fecha legible en formato es-AR sin desfase horario.
 * @param {string} isoDateString - Cadena de fecha en formato ISO (YYYY-MM-DD o timestamp).
 * @returns {string} Fecha formateada en formato local o la cadena original si no es válida.
 */
export const formatIsoDateForDisplay = (isoDateString) => {
  if (!isoDateString) {
    return '';
  }

  const [datePart] = isoDateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);

  if (!year || !month || !day) {
    return isoDateString;
  }

  const localDate = new Date(year, month - 1, day);
  return localDate.toLocaleDateString('es-AR');
};

/**
 * Convierte una cadena ISO con información de hora en un formato legible DD/MM/YYYY HH:mm.
 * Si la cadena no incluye hora, retorna solo la fecha formateada.
 * @param {string} isoDateString - Cadena de fecha en formato ISO.
 * @returns {string} Fecha y hora formateadas o la cadena original si no es válida.
 */
export const formatIsoDateTimeForDisplay = (isoDateString) => {
  if (!isoDateString) {
    return '';
  }

  if (!isoDateString.includes('T')) {
    return formatIsoDateForDisplay(isoDateString);
  }

  const date = new Date(isoDateString);

  if (Number.isNaN(date.getTime())) {
    return isoDateString;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};


/**
 * Valida que fecha_desde no sea mayor que fecha_hasta
 * @param {string} dateFrom - Fecha desde (formato ISO: YYYY-MM-DD)
 * @param {string} dateTo - Fecha hasta (formato ISO: YYYY-MM-DD)
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateDateRange = (dateFrom, dateTo) => {
  // Si no hay ambas fechas, no hay nada que validar
  if (!dateFrom || !dateTo) {
    return { isValid: true, error: null };
  }

  // Comparar fechas (strings en formato ISO se pueden comparar directamente)
  if (dateFrom > dateTo) {
    return {
      isValid: false,
      error: 'La fecha desde no puede ser mayor que la fecha hasta'
    };
  }

  return { isValid: true, error: null };
};



/**
 * Valida que una fecha no sea futura
 * @param {string} date - Fecha a validar (formato ISO: YYYY-MM-DD)
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateNotFutureDate = (date) => {
  if (!date) {
    return { isValid: true, error: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);

  if (selectedDate > today) {
    return {
      isValid: false,
      error: 'La fecha no puede ser futura'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Valida que una fecha esté dentro de un rango específico
 * @param {string} date - Fecha a validar (formato ISO: YYYY-MM-DD)
 * @param {number} maxDaysInPast - Días máximos en el pasado (default: 365)
 * @param {number} maxDaysInFuture - Días máximos en el futuro (default: 365)
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateDateInRange = (date, maxDaysInPast = 365, maxDaysInFuture = 365) => {
  if (!date) {
    return { isValid: true, error: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(date);
  
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() - maxDaysInPast);
  
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxDaysInFuture);

  if (selectedDate < minDate || selectedDate > maxDate) {
    return {
      isValid: false,
      error: `La fecha debe estar entre ${maxDaysInPast} días en el pasado y ${maxDaysInFuture} días en el futuro`
    };
  }

  return { isValid: true, error: null };
};

