import { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateReservationStatus } from '../../services/reservationService';

export default function ReleaseReservationModal({ reservation, onClose, onSuccess }) {
  const { token } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('4'); // Default: Finalizada
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!reservation) return null;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await updateReservationStatus(
        reservation.id_reserva,
        { id_est_op: parseInt(selectedStatus) },
        token
      );
      onSuccess();
    } catch (err) {
      console.error('Error al liberar reserva:', err);
      setError(err.response?.data?.error || err.message || 'Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Liberar Reserva</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-gray-700 mb-3">
              Vas a cambiar el estado de la reserva:
            </p>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 mb-1">Código de Reserva:</p>
              <p className="font-semibold text-gray-900">{reservation.cod_reserva}</p>
              <p className="text-xs text-gray-600 mt-1">Cliente: {reservation.cliente_nombre}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Selecciona el Nuevo Estado
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              >
                <option value="4">Finalizada</option>
                <option value="3">No aparecio</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {selectedStatus === '4' 
                  ? '✓ El cliente completó su estadía normalmente'
                  : '⚠️ El cliente no se presentó a su check-in'
                }
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Información:</strong> Esta acción actualizará el estado operativo de la reserva.
                {selectedStatus === '3' && ' Esto puede afectar las políticas de cancelación y reembolsos.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Actualizando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={18} />
                Confirmar Cambio
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
