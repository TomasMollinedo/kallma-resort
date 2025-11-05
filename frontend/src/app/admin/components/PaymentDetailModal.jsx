import { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, DollarSign, User, Mail, Phone, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPagoById, getMedioPagoBadgeColor } from '../../services/pagoService';
import { getStatusBadgeColor } from '../../services/reservationService';

/**
 * Modal para mostrar el detalle completo de un pago
 * Incluye información del pago, reserva asociada y auditoría
 */
export default function PaymentDetailModal({ pago, onClose }) {
  const { token } = useAuth();
  const [fullPago, setFullPago] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pago && token) {
      loadFullDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pago, token]);

  const loadFullDetails = async () => {
    try {
      setLoading(true);
      const response = await getPagoById(pago.id_pago, token);
      setFullPago(response.data);
    } catch (err) {
      console.error('Error al cargar detalle completo:', err);
      setError('No se pudo cargar el detalle completo del pago');
    } finally {
      setLoading(false);
    }
  };

  if (!pago) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full">
              <CreditCard size={32} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Detalle del Pago
              </h2>
              <p className="text-green-100 text-sm">
                ID: {pago.id_pago}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-green-500" />
            <p className="ml-4 text-gray-600">Cargando detalles...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        ) : fullPago ? (
          <div className="p-6 space-y-6">
            {/* Estado del Pago */}
            <div className="flex flex-wrap gap-4 pb-6 border-b border-gray-200">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
                fullPago.esta_activo 
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-red-100 text-red-800 border-red-300'
              }`}>
                {fullPago.esta_activo ? 'Pago Activo' : 'Pago Anulado'}
              </span>
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
                getMedioPagoBadgeColor(fullPago.nom_medio_pago)
              }`}>
                <CreditCard size={16} />
                {fullPago.nom_medio_pago}
              </span>
            </div>

            {/* Información del Pago */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-green-600" />
                Información del Pago
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Monto del Pago
                  </label>
                  <p className="text-gray-900 text-3xl font-bold">
                    ${parseFloat(fullPago.monto).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar size={14} />
                    Fecha del Pago
                  </label>
                  <p className="text-gray-900 text-lg font-medium">
                    {new Date(fullPago.fecha_pago).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de la Reserva */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-orange-600" />
                Información de la Reserva
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Código de Reserva
                  </label>
                  <p className="text-gray-900 text-lg font-medium">{fullPago.cod_reserva}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Check-in
                    </label>
                    <p className="text-gray-900">
                      {new Date(fullPago.check_in).toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Check-out
                    </label>
                    <p className="text-gray-900">
                      {new Date(fullPago.check_out).toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Cantidad de Personas
                    </label>
                    <p className="text-gray-900">{fullPago.cant_personas}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Estado de Reserva
                    </label>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                      getStatusBadgeColor(fullPago.estado_reserva)
                    }`}>
                      {fullPago.estado_reserva}
                    </span>
                  </div>
                </div>

                {/* Información Financiera de la Reserva */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="block text-gray-600 mb-1">Monto Total</label>
                      <p className="text-gray-900 font-bold text-lg">
                        ${parseFloat(fullPago.monto_total_res).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Monto Pagado</label>
                      <p className="text-green-700 font-bold text-lg">
                        ${parseFloat(fullPago.monto_pagado).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Saldo Pendiente</label>
                      <p className="text-orange-600 font-bold text-lg">
                        ${(parseFloat(fullPago.monto_total_res) - parseFloat(fullPago.monto_pagado)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                      fullPago.esta_pagada
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-orange-100 text-orange-800 border-orange-300'
                    }`}>
                      {fullPago.esta_pagada ? 'Reserva Pagada Completamente' : 'Pago Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-orange-600" />
                Información del Cliente
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <p className="text-gray-900 text-lg">{fullPago.nombre_cliente}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Mail size={14} />
                      Email
                    </label>
                    <p className="text-gray-900">{fullPago.email_cliente}</p>
                  </div>

                  {fullPago.telefono_cliente && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <Phone size={14} />
                        Teléfono
                      </label>
                      <p className="text-gray-900">{fullPago.telefono_cliente}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Auditoría */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-700 mb-3">Información de Auditoría</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-600 mb-1">Registrado por</label>
                  <p className="text-gray-900 font-medium">{fullPago.usuario_creacion}</p>
                  {fullPago.fecha_creacion && (
                    <p className="text-xs text-gray-500">
                      {new Date(fullPago.fecha_creacion).toLocaleString('es-ES')}
                    </p>
                  )}
                </div>

                {fullPago.usuario_modificacion && (
                  <div>
                    <label className="block text-gray-600 mb-1">Última Modificación</label>
                    <p className="text-gray-900 font-medium">{fullPago.usuario_modificacion}</p>
                    {fullPago.fecha_modificacion && (
                      <p className="text-xs text-gray-500">
                        {new Date(fullPago.fecha_modificacion).toLocaleString('es-ES')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Alerta si está anulado */}
            {!fullPago.esta_activo && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-sm font-semibold">
                  ⚠️ Este pago ha sido anulado y no se cuenta en el saldo de la reserva.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <p className="text-gray-600 text-center">No se pudieron cargar los detalles completos</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
