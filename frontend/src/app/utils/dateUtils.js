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
