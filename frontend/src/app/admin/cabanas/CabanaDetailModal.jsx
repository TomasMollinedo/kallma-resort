import { X, Home, Edit2, Calendar, User, CheckCircle, XCircle, AlertTriangle, MapPin } from 'lucide-react';
import { formatearFecha, getEstadoCabana } from '../../services/cabanaService';
import { formatIsoDateForDisplay } from '../../utils/dateUtils';

export default function CabanaDetailModal({ cabana, onClose, onEdit }) {
  if (!cabana) return null;

  const estado = getEstadoCabana(cabana.esta_activo, cabana.en_mantenimiento);

  /**
   * Obtener badge de estado con ícono y color
   */
  const getEstadoBadge = () => {
    const icons = {
      green: <CheckCircle size={20} />,
      yellow: <AlertTriangle size={20} />,
      red: <XCircle size={20} />
    };

    const colors = {
      green: 'bg-green-100 text-green-800 border-green-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      red: 'bg-red-100 text-red-800 border-red-300'
    };

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${colors[estado.color]}`}>
        {icons[estado.color]}
        {estado.texto}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full">
              <Home size={32} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Detalle de la Cabaña
              </h2>
              <p className="text-orange-100 text-sm">
                ID: #{cabana.id_cabana} - {cabana.cod_cabana}
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
        <div className="p-6 space-y-6">
          {/* Información Principal */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Home size={20} className="text-orange-600" />
              Información de la Cabaña
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Código */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Código de Cabaña
                </label>
                <p className="text-gray-900 text-lg font-medium">{cabana.cod_cabana}</p>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tipo de Cabaña
                </label>
                <p className="text-gray-900">{cabana.nom_tipo_cab}</p>
              </div>

              {/* Capacidad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Capacidad
                </label>
                <p className="text-gray-900">{cabana.capacidad} personas</p>
              </div>

              {/* Precio por noche */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Precio por Noche
                </label>
                <p className="text-gray-900 text-xl font-bold text-orange-600">
                  ${cabana.precio_noche?.toLocaleString()}
                </p>
              </div>

              {/* Zona */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin size={14} />
                  Zona
                </label>
                <p className="text-gray-900">{cabana.nom_zona}</p>
              </div>

              {/* Estado de hoy */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Estado Hoy
                </label>
                {cabana.reservada_hoy ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                    <CheckCircle size={16} />
                    Reservada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 border border-gray-300">
                    Disponible
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Estado y Mantenimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estado Activo */}
            <div className="bg-blue-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estado de la Cabaña
              </label>
              {getEstadoBadge()}
              {estado.descripcion && (
                <p className="text-sm text-gray-600 mt-2">{estado.descripcion}</p>
              )}
            </div>

            {/* Estado de Mantenimiento */}
            {cabana.esta_activo && (
              <div className={`rounded-lg p-4 ${cabana.en_mantenimiento ? 'bg-yellow-50' : 'bg-green-50'}`}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mantenimiento
                </label>
                {cabana.en_mantenimiento ? (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
                    <AlertTriangle size={16} />
                    En Mantenimiento
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-300">
                    <CheckCircle size={16} />
                    Operativa
                  </span>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  {cabana.en_mantenimiento 
                    ? 'La cabaña está cerrada temporalmente por mantenimiento'
                    : 'La cabaña está operativa y disponible'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Información de Auditoría */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-orange-600" />
              Información del Sistema
            </h3>

            <div className="space-y-3">
              {/* Fecha de creación */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Fecha de Creación</span>
                <span className="text-sm text-gray-900">{formatearFecha(cabana.fecha_creacion)}</span>
              </div>

              {/* Usuario creador */}
              {cabana.usuario_creacion && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <User size={14} />
                    Creada por
                  </span>
                  <span className="text-sm text-gray-900 font-medium">{cabana.usuario_creacion}</span>
                </div>
              )}

              {/* Fecha de modificación */}
              {cabana.fecha_modific && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Última Modificación</span>
                  <span className="text-sm text-gray-900 font-medium">{formatearFecha(cabana.fecha_modific)}</span>
                </div>
              )}

              {!cabana.fecha_modific && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Última Modificación</span>
                  <span className="text-sm text-gray-500 italic">Sin modificaciones</span>
                </div>
              )}

              {/* Usuario modificador */}
              {cabana.usuario_modificacion && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <User size={14} />
                    Modificada por
                  </span>
                  <span className="text-sm text-gray-900 font-medium">{cabana.usuario_modificacion}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información adicional del tipo */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-orange-900 mb-2">
              📋 Información del Tipo de Cabaña
            </h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• <strong>Tipo:</strong> {cabana.nom_tipo_cab}</li>
              <li>• <strong>Capacidad máxima:</strong> {cabana.capacidad} personas</li>
              <li>• <strong>Precio por noche:</strong> ${cabana.precio_noche?.toLocaleString()}</li>
            </ul>
          </div>

          {/* Alerta si está inactiva */}
          {!cabana.esta_activo && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>⚠️ Cabaña Inactiva:</strong> Esta cabaña ha sido eliminada (borrado lógico).
                No aparecerá en las búsquedas de disponibilidad. Un administrador puede restaurarla.
              </p>
            </div>
          )}

          {/* Alerta si está en mantenimiento */}
          {cabana.en_mantenimiento && cabana.esta_activo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>🔧 En Mantenimiento:</strong> Esta cabaña está temporalmente cerrada por mantenimiento.
                No estará disponible para nuevas reservas hasta que se reactive.
              </p>
            </div>
          )}

          {/* Reservas Vinculadas */}
          {cabana.reservas && cabana.reservas.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-orange-600" />
                Últimas Reservas ({cabana.total_reservas})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Check-in</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Check-out</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Personas</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Monto</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cabana.reservas.map((reserva) => (
                      <tr key={reserva.id_reserva} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{reserva.cod_reserva}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div>{reserva.nombre_cliente}</div>
                          <div className="text-xs text-gray-500">{reserva.email_cliente}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatIsoDateForDisplay(reserva.check_in)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {formatIsoDateForDisplay(reserva.check_out)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{reserva.cant_personas}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          ${reserva.monto_total_res?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            reserva.estado === 'Confirmada' ? 'bg-blue-100 text-blue-800' :
                            reserva.estado === 'Finalizada' ? 'bg-green-100 text-green-800' :
                            reserva.estado === 'Cancelada' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reserva.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {cabana.reservas && cabana.reservas.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Sin Reservas:</strong> Esta cabaña no tiene reservas registradas.
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              <Edit2 size={20} />
              Editar Cabaña
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
