import { AlertTriangle, X } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Modal reutilizable para confirmar la eliminación de un elemento
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado del modal (abierto/cerrado)
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onConfirm - Función que se ejecuta al confirmar la eliminación
 * @param {string} props.title - Título del modal
 * @param {string} props.message - Mensaje principal de confirmación
 * @param {string} props.itemName - Nombre del elemento a eliminar (para resaltar)
 * @param {string} props.itemType - Tipo de elemento (zona, cabaña, usuario, etc.)
 * @param {string} props.confirmButtonText - Texto del botón de confirmación (default: "Eliminar")
 * @param {boolean} props.isLoading - Estado de carga durante la operación
 */
export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Eliminación",
  message,
  itemName,
  itemType = "elemento",
  confirmButtonText = "Eliminar",
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
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={24} />
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
              {message || `¿Estás seguro de que deseas eliminar este ${itemType}?`}
            </p>
            
            {itemName && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-600 mb-1">
                  {itemType.charAt(0).toUpperCase() + itemType.slice(1)} a eliminar:
                </p>
                <p className="font-semibold text-gray-900">{itemName}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Advertencia:</strong> Esta acción marcará el {itemType} como inactivo 
                y no podrá ser utilizado en operaciones futuras.
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
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Eliminando...
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

DeleteConfirmationModal.propTypes = {
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
