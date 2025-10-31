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

