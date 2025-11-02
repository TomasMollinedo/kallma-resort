import { RotateCcw, X } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Modal reutilizable para confirmar la restauración de un elemento
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado del modal (abierto/cerrado)
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onConfirm - Función que se ejecuta al confirmar la restauración
 * @param {string} props.title - Título del modal
 * @param {string} props.message - Mensaje principal de confirmación
 * @param {string} props.itemName - Nombre del elemento a restaurar (para resaltar)
 * @param {string} props.itemType - Tipo de elemento (zona, cabaña, usuario, etc.)
 * @param {string} props.confirmButtonText - Texto del botón de confirmación (default: "Restaurar")
 * @param {boolean} props.isLoading - Estado de carga durante la operación
 */
export default function RestoreConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Restauración",
  message,
  itemName,
  itemType = "elemento",
  confirmButtonText = "Restaurar",
  isLoading = false
}) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <RotateCcw className="text-green-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-3">
              {message || `¿Estás seguro de que deseas restaurar este ${itemType}?`}
            </p>
            
            {itemName && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-600 mb-1">
                  {itemType.charAt(0).toUpperCase() + itemType.slice(1)} a restaurar:
                </p>
                <p className="font-semibold text-gray-900">{itemName}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>✓ Información:</strong> Esta acción marcará el {itemType} como activo 
                y estará disponible para operaciones normales.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Restaurando...
              </span>
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

RestoreConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  itemName: PropTypes.string,
  itemType: PropTypes.string,
  confirmButtonText: PropTypes.string,
  isLoading: PropTypes.bool
};
