import { AlertCircle, X, Home, Map, Calendar } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Modal reutilizable para mostrar errores de dependencias al intentar eliminar
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Estado del modal (abierto/cerrado)
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} props.itemName - Nombre del elemento que se intentó eliminar
 * @param {string} props.itemType - Tipo de elemento (zona, cabaña, usuario)
 * @param {string} props.dependencyType - Tipo de dependencia (cabañas, reservas)
 * @param {number} props.dependencyCount - Cantidad de elementos dependientes
 */
export default function DependencyErrorModal({
  isOpen,
  onClose,
  itemName,
  itemType = "elemento",
  dependencyType = "elementos",
  dependencyCount = 0
}) {
  if (!isOpen) return null;

  // Iconos según el tipo de dependencia
  const getIcon = () => {
    switch (dependencyType.toLowerCase()) {
      case 'cabañas':
      case 'cabaña':
        return <Home className="text-orange-600" size={32} />;
      case 'reservas':
      case 'reserva':
        return <Calendar className="text-blue-600" size={32} />;
      case 'zonas':
      case 'zona':
        return <Map className="text-green-600" size={32} />;
      default:
        return <AlertCircle className="text-red-600" size={32} />;
    }
  };

  // Mensaje personalizado según el tipo
  const getMessage = () => {
    const plural = dependencyCount > 1;
    
    if (itemType === 'zona') {
      return `La zona "${itemName}" tiene ${dependencyCount} cabaña${plural ? 's' : ''} activa${plural ? 's' : ''} asignada${plural ? 's' : ''}.`;
    } else if (itemType === 'cabaña') {
      return `La cabaña "${itemName}" tiene ${dependencyCount} reserva${plural ? 's' : ''} activa${plural ? 's' : ''} o futura${plural ? 's' : ''}.`;
    } else if (itemType === 'usuario') {
      return `El usuario "${itemName}" tiene ${dependencyCount} reserva${plural ? 's' : ''} activa${plural ? 's' : ''} o futura${plural ? 's' : ''}.`;
    }
    
    return `El ${itemType} "${itemName}" tiene ${dependencyCount} ${dependencyType} vinculado${plural ? 's' : ''}.`;
  };

  // Sugerencias según el tipo
  const getSuggestions = () => {
    if (itemType === 'zona') {
      return [
        'Elimina o reasigna todas las cabañas activas de esta zona',
        'Verifica que no haya cabañas en uso antes de eliminar la zona',
        'Puedes ver el detalle de la zona para revisar las cabañas asignadas'
      ];
    } else if (itemType === 'cabaña') {
      return [
        'Cancela las reservas activas antes de eliminar la cabaña',
        'Espera a que finalicen las reservas futuras',
        'Contacta con los clientes para reprogramar sus reservas a otras cabañas'
      ];
    } else if (itemType === 'usuario') {
      return [
        'Cancela las reservas activas del usuario antes de desactivarlo',
        'Espera a que finalicen las reservas futuras',
        'Contacta al usuario para gestionar sus reservas pendientes'
      ];
    }
    
    return [
      `Elimina los ${dependencyCount} ${dependencyType} vinculados antes de continuar`,
      'Verifica las dependencias en el detalle del elemento',
      'Considera reasignar en lugar de eliminar'
    ];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No se puede eliminar</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Icono y mensaje principal */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                Elemento con dependencias
              </h3>
              <p className="text-gray-700">
                {getMessage()}
              </p>
            </div>
          </div>

          {/* Contador destacado */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-800">
                {dependencyType.charAt(0).toUpperCase() + dependencyType.slice(1)} vinculad{dependencyCount > 1 ? 'os' : 'o'}:
              </span>
              <span className="text-2xl font-bold text-orange-600">
                {dependencyCount}
              </span>
            </div>
          </div>

          {/* Sugerencias */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              💡 ¿Qué puedes hacer?
            </h4>
            <ul className="space-y-2">
              {getSuggestions().map((suggestion, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

DependencyErrorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  itemName: PropTypes.string.isRequired,
  itemType: PropTypes.string,
  dependencyType: PropTypes.string,
  dependencyCount: PropTypes.number
};
