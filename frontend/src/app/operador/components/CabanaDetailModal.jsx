import { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Home,
  Loader2,
  MapPin,
  User,
  Wrench,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getCabanaById,
  getEstadoCabana,
  formatearFecha,
  updateCabanaMaintenance
} from '../../services/cabanaService';
import { formatIsoDateForDisplay } from '../../utils/dateUtils';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0
});

/**
 * Formatea un monto numérico a pesos argentinos.
 * @param {number} value - Monto a formatear.
 * @returns {string} Valor formateado en moneda local.
 */
const formatCurrency = (value) => currencyFormatter.format(value ?? 0);

/**
 * Modal de detalle para operadores, muestra la información extendida de una cabaña
 * y permite cambiar su estado de mantenimiento utilizando el endpoint dedicado.
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.cabana - Cabaña seleccionada desde el mapa (datos resumidos).
 * @param {Function} props.onClose - Callback para cerrar el modal.
 * @param {Function} props.onMaintenanceChange - Callback a ejecutar después de actualizar el mantenimiento.
 * @returns {JSX.Element|null} Modal con detalle de cabaña o null si no hay cabaña.
 */
export default function CabanaDetailModal({ cabana, onClose, onMaintenanceChange }) {
  const { token } = useAuth();
  const [fullCabana, setFullCabana] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [detailError, setDetailError] = useState(null);
  const [updatingMaintenance, setUpdatingMaintenance] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  useEffect(() => {
    if (cabana && token) {
      loadCabanaDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cabana, token]);

  /**
   * Recupera desde el backend el detalle completo de la cabaña seleccionada.
   * Aplica feedback visual durante la carga y captura errores.
   */
  const loadCabanaDetails = async () => {
    try {
      setLoadingDetails(true);
      setDetailError(null);
      const response = await getCabanaById(cabana.id_cabana, token);
      setFullCabana(response.data);
    } catch (error) {
      setDetailError(error.message || 'No pudimos cargar el detalle de la cabaña.');
    } finally {
      setLoadingDetails(false);
    }
  };

  /**
   * Cambia el estado de mantenimiento utilizando el endpoint protegido.
   * Al finalizar, recarga el detalle y notifica al componente padre.
   */
  const handleToggleMaintenance = async () => {
    if (!fullCabana) {
      return;
    }

    if (!fullCabana.esta_activo) {
      setActionFeedback({
        type: 'error',
        text: 'No puedes modificar el mantenimiento de una cabaña inactiva. Reactívala desde administración.'
      });
      return;
    }

    try {
      setUpdatingMaintenance(true);
      setActionFeedback(null);
      const desiredState = !fullCabana.en_mantenimiento;
      const response = await updateCabanaMaintenance(fullCabana.id_cabana, desiredState, token);

      setActionFeedback({
        type: 'success',
        text: response.message || 'Estado de mantenimiento actualizado correctamente.'
      });

      await loadCabanaDetails();
      if (typeof onMaintenanceChange === 'function') {
        onMaintenanceChange(response.data);
      }
    } catch (error) {
      setActionFeedback({
        type: 'error',
        text: error.message || 'No pudimos actualizar el estado de mantenimiento.'
      });
    } finally {
      setUpdatingMaintenance(false);
    }
  };

  if (!cabana) {
    return null;
  }

  const estado = getEstadoCabana(fullCabana?.esta_activo, fullCabana?.en_mantenimiento);
  const isInactive = Boolean(fullCabana && !fullCabana.esta_activo);
  const maintenanceDisabled = isInactive || updatingMaintenance;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full">
              <Home size={32} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Detalle de la Cabaña</h2>
              <p className="text-orange-100 text-sm">
                ID: #{cabana.id_cabana} - {cabana.cod_cabana}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {loadingDetails ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-600">
            <Loader2 size={48} className="animate-spin text-orange-500 mb-4" />
            Cargando información de la cabaña...
          </div>
        ) : detailError ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700">
              <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Ocurrió un problema</p>
                <p className="text-sm">{detailError}</p>
              </div>
            </div>
          </div>
        ) : fullCabana ? (
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Home size={20} className="text-orange-600" />
                Información general
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <p className="text-sm text-gray-500">Código</p>
                  <p className="text-xl font-semibold text-gray-900">{fullCabana.cod_cabana}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo</p>
                  <p className="text-base font-semibold text-gray-900">{fullCabana.nom_tipo_cab}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} />
                    Zona
                  </p>
                  <p className="text-base font-semibold text-gray-900">{fullCabana.nom_zona}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Capacidad</p>
                  <p className="text-base font-semibold text-gray-900">
                    {fullCabana.capacidad} personas
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Precio por noche</p>
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(fullCabana.precio_noche)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reservada hoy</p>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${
                      fullCabana.reservada_hoy
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {fullCabana.reservada_hoy ? 'Sí, con huéspedes' : 'No, disponible'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <p className="text-sm font-semibold text-gray-600 mb-2">Estado actual</p>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
                    estado.color === 'green'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : estado.color === 'yellow'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      : 'bg-red-100 text-red-800 border-red-300'
                  }`}
                >
                  {estado.color === 'green' && <CheckCircle size={18} />}
                  {estado.color === 'yellow' && <AlertTriangle size={18} />}
                  {estado.color === 'red' && <AlertTriangle size={18} />}
                  {estado.texto}
                </span>
                {estado.descripcion && (
                  <p className="text-sm text-gray-600 mt-2">{estado.descripcion}</p>
                )}
              </div>

              <div
                className={`rounded-xl p-5 border ${
                  fullCabana.en_mantenimiento
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <Wrench size={16} />
                  Mantenimiento operativo
                </p>
                <p className="text-base font-semibold text-gray-900 mb-3">
                  {isInactive
                    ? 'La cabaña está inactiva; el mantenimiento no aplica.'
                    : fullCabana.en_mantenimiento
                    ? 'La cabaña está en mantenimiento'
                    : 'La cabaña está operativa'}
                </p>
                <button
                  type="button"
                  onClick={handleToggleMaintenance}
                  disabled={maintenanceDisabled}
                  className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${
                    isInactive
                      ? 'bg-gray-200 text-gray-600'
                      : fullCabana.en_mantenimiento
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  }`}
                >
                  {updatingMaintenance ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : isInactive ? (
                    <>
                      <AlertCircle size={20} />
                      Cabaña inactiva
                    </>
                  ) : fullCabana.en_mantenimiento ? (
                    <>
                      <CheckCircle size={20} />
                      Finalizar mantenimiento
                    </>
                  ) : (
                    <>
                      <Wrench size={20} />
                      Enviar a mantenimiento
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  {isInactive
                    ? 'Para gestionar mantenimiento primero reactiva la cabaña desde administración.'
                    : 'Esta acción actualiza el estado en todas las vistas, incluido el mapa.'}
                </p>
              </div>
            </div>

            {actionFeedback && (
              <div
                className={`rounded-xl p-4 border flex items-start gap-3 ${
                  actionFeedback.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {actionFeedback.type === 'success' ? (
                  <CheckCircle size={20} className="mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="mt-0.5" />
                )}
                <p className="text-sm">{actionFeedback.text}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-orange-600" />
                Información del sistema
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold">Fecha de creación</span>
                  <span>{formatearFecha(fullCabana.fecha_creacion)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold">Última modificación</span>
                  <span>{formatearFecha(fullCabana.fecha_modific)}</span>
                </div>
                {fullCabana.usuario_modificacion && (
                  <div className="flex justify-between">
                    <span className="font-semibold flex items-center gap-1">
                      <User size={14} />
                      Modificado por
                    </span>
                    <span>{fullCabana.usuario_modificacion}</span>
                  </div>
                )}
              </div>
            </div>

            {fullCabana.reservas && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Últimas reservas ({fullCabana.total_reservas || fullCabana.reservas.length})
                </h3>
                {fullCabana.reservas.length === 0 ? (
                  <p className="text-sm text-gray-500">Esta cabaña aún no registra reservas.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">Código</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">Cliente</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">Check-in</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">Check-out</th>
                          <th className="px-4 py-2 text-left font-semibold text-gray-600">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {fullCabana.reservas.map((reserva) => (
                          <tr key={reserva.id_reserva} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-semibold text-gray-900">
                              {reserva.cod_reserva}
                            </td>
                            <td className="px-4 py-2">
                              <div className="font-semibold text-gray-900">
                                {reserva.nombre_cliente}
                              </div>
                              <div className="text-xs text-gray-500">{reserva.email_cliente}</div>
                            </td>
                            <td className="px-4 py-2">{formatIsoDateForDisplay(reserva.check_in)}</td>
                            <td className="px-4 py-2">{formatIsoDateForDisplay(reserva.check_out)}</td>
                            <td className="px-4 py-2 font-semibold text-gray-900">
                              {formatCurrency(reserva.monto_total_res)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
