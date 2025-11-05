import { useState, useEffect } from 'react';
import { X, Calendar, User, Mail, Phone, Home, Users, DollarSign, Clock, CheckCircle, Loader2, CreditCard, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getReservationById, getStatusBadgeColor } from '../../services/reservationService';
import { formatIsoDateForDisplay } from '../../utils/dateUtils';
import { getPagosByReserva, getMedioPagoBadgeColor } from '../../services/pagoService';
import PaymentFormModal from './PaymentFormModal';

export default function ReservationDetailModal({ reservation, onClose }) {
  const { token, user } = useAuth();
  const [fullReservation, setFullReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagos, setPagos] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (reservation && token) {
      loadFullDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservation, token]);

  const loadFullDetails = async () => {
    try {
      setLoading(true);
      const response = await getReservationById(reservation.id_reserva, token);
      setFullReservation(response.data);
      // Cargar pagos asociados después de cargar la reserva
      await loadPagos();
    } catch (error) {
      console.error('Error al cargar detalle completo:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPagos = async () => {
    try {
      setLoadingPagos(true);
      const response = await getPagosByReserva(reservation.id_reserva, token);
      setPagos(response.data || []);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
      setPagos([]);
    } finally {
      setLoadingPagos(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    // Recargar detalle completo y pagos para actualizar montos
    loadFullDetails();
    loadPagos();
  };

  const isStaff = user?.rol === 'Operador' || user?.rol === 'Administrador';
  const canRegisterPayment = isStaff && fullReservation?.estado_operativo === 'Confirmada';

  if (!reservation) return null;

  const getStatusBadge = (estado) => {
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadgeColor(estado)}`}>
        <CheckCircle size={16} />
        {estado}
      </span>
    );
  };

  const getPaymentBadge = (estaPagada) => {
    if (estaPagada) {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-300">
          <DollarSign size={16} />
          Pagada
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 border border-orange-300">
          <Clock size={16} />
          Pendiente
        </span>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full">
              <Calendar size={32} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Detalle de la Reserva
              </h2>
              <p className="text-orange-100 text-sm">
                {reservation.cod_reserva}
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
            <Loader2 size={48} className="animate-spin text-orange-500" />
            <p className="ml-4 text-gray-600">Cargando detalles...</p>
          </div>
        ) : fullReservation ? (
          <div className="p-6 space-y-6">
            {/* Estado y Badges */}
            <div className="flex flex-wrap gap-4 pb-6 border-b border-gray-200">
              {getStatusBadge(fullReservation.estado_operativo)}
              {getPaymentBadge(fullReservation.esta_pagada)}
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                <Clock size={16} />
                {fullReservation.noches} noche(s)
              </span>
            </div>

            {/* Información del Cliente */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-orange-600" />
                Información del Cliente
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <p className="text-gray-900 text-lg font-medium">{fullReservation.cliente_nombre}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Mail size={14} />
                      Email
                    </label>
                    <p className="text-gray-900">{fullReservation.cliente_email}</p>
                  </div>

                  {fullReservation.cliente_telefono && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <Phone size={14} />
                        Teléfono
                      </label>
                      <p className="text-gray-900">{fullReservation.cliente_telefono}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detalles de la Reserva */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-orange-600" />
                Detalles de la Reserva
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Check-in
                  </label>
                  <p className="text-gray-900 text-lg font-medium">{formatIsoDateForDisplay(fullReservation.check_in)}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Check-out
                  </label>
                  <p className="text-gray-900 text-lg font-medium">{formatIsoDateForDisplay(fullReservation.check_out)}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Users size={14} />
                    Cantidad de Personas
                  </label>
                  <p className="text-gray-900">{fullReservation.cant_personas} persona(s)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Clock size={14} />
                    Noches
                  </label>
                  <p className="text-gray-900">
                    {fullReservation.noches} noche(s)
                  </p>
                </div>
              </div>
            </div>

            {/* Cabañas Asignadas */}
            {fullReservation.cabanas && fullReservation.cabanas.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Home size={20} className="text-orange-600" />
                  Cabañas Asignadas ({fullReservation.cabanas.length})
                </h3>
                
                <div className="space-y-3">
                  {fullReservation.cabanas.map((cabana) => (
                    <div key={cabana.id_cabana} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{cabana.cod_cabana}</p>
                          <p className="text-sm text-gray-600">{cabana.nom_tipo_cab}</p>
                          <p className="text-xs text-gray-500">Zona: {cabana.nom_zona}</p>
                          <p className="text-xs text-gray-500 mt-1">Capacidad: {cabana.capacidad} personas</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Precio por Noche</p>
                          <p className="font-semibold text-orange-600 text-lg">
                            ${parseFloat(cabana.precio_noche).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Servicios Adicionales */}
            {fullReservation.servicios && fullReservation.servicios.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Servicios Adicionales ({fullReservation.servicios.length})
                </h3>
                
                <div className="space-y-3">
                  {fullReservation.servicios.map((servicio, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{servicio.nom_servicio}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Precio Unitario</p>
                          <p className="font-semibold text-gray-900">
                            ${parseFloat(servicio.precio_servicio).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información de Pagos */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign size={20} className="text-orange-600" />
                  Información de Pagos
                </h3>
                {canRegisterPayment && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition text-sm"
                  >
                    <Plus size={18} />
                    Registrar Pago
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Monto Total
                  </label>
                  <p className="text-gray-900 text-2xl font-bold">
                    ${parseFloat(fullReservation.monto_total_res).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Monto Pagado
                  </label>
                  <p className="text-gray-900 text-2xl font-bold">
                    ${parseFloat(fullReservation.monto_pagado).toLocaleString()}
                  </p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Saldo Pendiente
                  </label>
                  <p className="text-orange-600 text-2xl font-bold">
                    ${(parseFloat(fullReservation.monto_total_res) - parseFloat(fullReservation.monto_pagado)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Historial de Pagos */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-orange-600" />
                Historial de Pagos ({pagos.length})
              </h3>
              
              {loadingPagos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={32} className="animate-spin text-orange-500" />
                  <p className="ml-3 text-gray-600">Cargando pagos...</p>
                </div>
              ) : pagos.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                  <CreditCard size={48} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-600 font-medium">Sin Pagos Registrados</p>
                  <p className="text-sm text-gray-500">Esta reserva aún no tiene pagos asociados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pagos.map((pago) => (
                    <div 
                      key={pago.id_pago} 
                      className={`bg-white p-4 rounded-lg border ${
                        pago.esta_activo ? 'border-gray-200' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                              getMedioPagoBadgeColor(pago.nom_medio_pago)
                            }`}>
                              <CreditCard size={12} />
                              {pago.nom_medio_pago}
                            </span>
                            {!pago.esta_activo && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                                Anulado
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Fecha: {new Date(pago.fecha_pago).toLocaleDateString('es-ES')}
                          </p>
                          {pago.usuario_creo_pago && (
                            <p className="text-xs text-gray-500 mt-1">
                              Registrado por: {pago.usuario_creo_pago}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Monto</p>
                          <p className={`font-bold text-xl ${
                            pago.esta_activo ? 'text-green-600' : 'text-red-600 line-through'
                          }`}>
                            ${parseFloat(pago.monto).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Metadatos */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-600 mb-1">Fecha de Creación</label>
                  <p className="text-gray-900 font-medium">
                    {new Date(fullReservation.fecha_creacion).toLocaleString('es-ES')}
                  </p>
                  {fullReservation.usuario_creacion && (
                    <p className="text-xs text-gray-500">Por: {fullReservation.usuario_creacion}</p>
                  )}
                </div>

                {fullReservation.fecha_modific && (
                  <div>
                    <label className="block text-gray-600 mb-1">Última Modificación</label>
                    <p className="text-gray-900 font-medium">
                      {new Date(fullReservation.fecha_modific).toLocaleString('es-ES')}
                    </p>
                    {fullReservation.usuario_modificacion && (
                      <p className="text-xs text-gray-500">Por: {fullReservation.usuario_modificacion}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
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

      {/* Modal de Registro de Pago */}
      {showPaymentModal && fullReservation && (
        <PaymentFormModal
          reserva={fullReservation}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
