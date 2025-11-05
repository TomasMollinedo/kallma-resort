import { useState, useEffect } from 'react';
import { AlertTriangle, X, Ban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { anularPago } from '../../services/pagoService';
import { getReservationById } from '../../services/reservationService';

/**
 * Modal para anular un pago con validaciones especiales
 * - Valida que la reserva esté en estado "Confirmada"
 * - Impide anular si la reserva está Finalizada, Cancelada o No apareció
 * - Usa componente personalizado con validaciones del backend
 */
export default function AnularPagoModal({ pago, onClose, onSuccess }) {
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [canAnular, setCanAnular] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [reservaEstado, setReservaEstado] = useState(null);

  // Verificar el estado de la reserva al abrir el modal
  useEffect(() => {
    const checkReservation = async () => {
      try {
        setChecking(true);
        const response = await getReservationById(pago.id_reserva, token);
        const reserva = response.data;
        setReservaEstado(reserva.estado_operativo);
        
        // Validar estados no permitidos
        const estadosNoPermitidos = ['Finalizada', 'Cancelada', 'No aparecio'];
        if (estadosNoPermitidos.includes(reserva.estado_operativo)) {
          setCanAnular(false);
          setErrorMessage(`No se puede anular un pago de una reserva con estado "${reserva.estado_operativo}"`);
        } else {
          setCanAnular(true);
        }
      } catch (err) {
        console.error('Error al verificar reserva:', err);
        setCanAnular(false);
        setErrorMessage('Error al verificar el estado de la reserva');
      } finally {
        setChecking(false);
      }
    };

    if (pago && token) {
      checkReservation();
    }
  }, [pago, token]);

  const handleAnular = async () => {
    if (!canAnular) return;

    setLoading(true);
    try {
      await anularPago(pago.id_pago, token);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error al anular pago:', err);
      
      // Manejar errores específicos del backend
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Error al anular el pago. Por favor, intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!pago) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              {errorMessage ? (
                <Ban className="text-red-600" size={24} />
              ) : (
                <AlertTriangle className="text-red-600" size={24} />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {errorMessage ? 'No se puede anular' : 'Confirmar Anulación'}
            </h2>
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
          {checking ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
              <p className="ml-3 text-gray-600">Verificando estado de la reserva...</p>
            </div>
          ) : errorMessage ? (
            <>
              <div className="mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-semibold mb-2">Error de Validación</p>
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>

                {reservaEstado && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Estado actual de la reserva:</p>
                    <p className="font-semibold text-gray-900">{reservaEstado}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Información:</strong> Solo se pueden anular pagos de reservas en estado "Confirmada".
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-700 mb-3">
                  ¿Estás seguro de que deseas anular este pago?
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-600 mb-1">Pago a anular:</p>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">
                      Monto: ${parseFloat(pago.monto).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-700">
                      Reserva: {pago.cod_reserva}
                    </p>
                    <p className="text-sm text-gray-700">
                      Fecha: {new Date(pago.fecha_pago).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Advertencia:</strong> Esta acción marcará el pago como anulado 
                    y restará el monto del total pagado de la reserva. La reserva volverá a tener 
                    saldo pendiente.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50"
          >
            {errorMessage ? 'Entendido' : 'Cancelar'}
          </button>
          {!errorMessage && !checking && canAnular && (
            <button
              onClick={handleAnular}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Anulando...
                </span>
              ) : (
                'Anular Pago'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
