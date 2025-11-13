import { AlertTriangle, Calendar, House, X } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Formatea una fecha al formato legible DD/MM/YYYY.
 * @param {string} dateString - Fecha en formato ISO o YYYY-MM-DD.
 * @returns {string} Fecha formateada o '-' si no es válida.
 */
const formatDate = (dateString) => {
  if (!dateString) {
    return '-';
  }

  try {
    const parsedDate = new Date(dateString);
    if (Number.isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return '-';
  }
};

/**
 * Modal de confirmación para cancelar una reserva del cliente.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Indica si el modal está visible.
 * @param {Function} props.onClose - Función para cerrar el modal.
 * @param {Function} props.onConfirm - Función que ejecuta la cancelación.
 * @param {boolean} props.isLoading - Indica si la operación está en progreso.
 * @param {string} props.reservationCode - Código identificador de la reserva.
 * @param {string} props.checkInDate - Fecha de check-in de la reserva.
 * @param {string} props.cabinsDescription - Información breve de las cabañas incluidas.
 * @param {string} props.errorMessage - Mensaje de error a mostrar dentro del modal.
 */
export default function CancelReservationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  reservationCode,
  checkInDate,
  cabinsDescription,
  errorMessage
}) {
  if (!isOpen) {
    return null;
  }

  /**
   * Ejecuta la acción de confirmación delegada por el contenedor.
   */
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cancelar reserva</h2>
              <p className="text-sm text-gray-500">
                Esta acción no se puede deshacer y seguirá las políticas vigentes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            ¿Deseas cancelar tu reserva?
            <span className="font-semibold text-gray-900">
              {reservationCode ? ` (#${reservationCode})` : ''}
            </span>
          </p>

          <div className="rounded-lg border border-gray-200 bg-gray-50 divide-y divide-gray-200">
            {reservationCode && (
              <div className="flex items-center gap-3 p-4">
                <AlertTriangle size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Código de reserva</p>
                  <p className="font-semibold text-gray-900">{reservationCode}</p>
                </div>
              </div>
            )}

            {checkInDate && (
              <div className="flex items-center gap-3 p-4">
                <Calendar size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Check-in programado</p>
                  <p className="font-semibold text-gray-900">{formatDate(checkInDate)}</p>
                </div>
              </div>
            )}

            {cabinsDescription && (
              <div className="flex items-center gap-3 p-4">
                <House size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Cabañas reservadas</p>
                  <p className="font-semibold text-gray-900">{cabinsDescription}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Solo puedes cancelar hasta 24 horas antes del check-in. Si te encuentras dentro de ese periodo,
              el sistema no permitirá la operación.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50"
          >
            Regresar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Cancelando...' : 'Confirmar cancelación'}
          </button>
        </div>
      </div>
    </div>
  );
}

CancelReservationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  reservationCode: PropTypes.string,
  checkInDate: PropTypes.string,
  cabinsDescription: PropTypes.string,
  errorMessage: PropTypes.string
};
