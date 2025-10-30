import { useState } from 'react';
import { Calendar, Search, Loader2, AlertCircle, Home, MapPin, Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCabanasReservadas } from '../../services/cabanaService';

export default function CabanasReservadas() {
  const { token } = useAuth();

  // Estados
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cabanas, setCabanas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  /**
   * Consultar cabañas reservadas para la fecha especificada
   */
  const handleConsultar = async () => {
    if (!fecha) {
      setError('Debe ingresar una fecha válida');
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await getCabanasReservadas(fecha, token);
      // El backend retorna { ok, data, fecha_consultada }
      setCabanas(response?.data || []);
    } catch (err) {
      console.error('Error al consultar cabañas reservadas:', err);
      setError(err.message || 'Error al consultar las cabañas reservadas');
      setCabanas([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener badge de estado de cabaña
   */
  const getEstadoBadge = (estaActivo, enMantenimiento) => {
    if (!estaActivo) {
      return {
        texto: 'Inactiva',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: <XCircle size={16} />
      };
    }
    if (enMantenimiento) {
      return {
        texto: 'Mantenimiento',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: <AlertTriangle size={16} />
      };
    }
    return {
      texto: 'Activa',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: <CheckCircle size={16} />
    };
  };

  /**
   * Obtener badge de estado de reserva
   */
  const getEstadoReservaBadge = (estado) => {
    const estados = {
      'Confirmada': 'bg-blue-100 text-blue-800',
      'Finalizada': 'bg-green-100 text-green-800',
      'Cancelada': 'bg-red-100 text-red-800',
      'No aparecio': 'bg-gray-100 text-gray-800'
    };
    return estados[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full">
            <Calendar size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Cabañas Reservadas</h1>
            <p className="text-blue-100 mt-1">
              Consulta las cabañas que están reservadas en una fecha específica
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-gray-600" />
          <span className="font-semibold text-gray-900">Seleccionar Fecha de Consulta</span>
        </div>

        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha a Consultar
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Selecciona la fecha para ver qué cabañas están reservadas
            </p>
          </div>

          <button
            onClick={handleConsultar}
            disabled={loading || !fecha}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Consultando...
              </>
            ) : (
              <>
                <Search size={20} />
                Consultar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start gap-3">
          <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Resultados */}
      {searched && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {cabanas.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Sin Reservas
              </h3>
              <p className="text-gray-600">
                No hay cabañas reservadas para el {new Date(fecha).toLocaleDateString('es-AR')}
              </p>
            </div>
          ) : (
            <>
              {/* Header de resultados */}
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
                <h3 className="font-bold text-blue-900">
                  {cabanas.length} Cabaña{cabanas.length !== 1 ? 's' : ''} Reservada{cabanas.length !== 1 ? 's' : ''} para el {new Date(fecha).toLocaleDateString('es-AR')}
                </h3>
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Cabaña
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Zona
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Capacidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Precio/Noche
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Estado Cabaña
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Reserva
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Check-in / Check-out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Estado Reserva
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cabanas.map((cabana) => {
                      const estadoCabana = getEstadoBadge(cabana.esta_activo, cabana.en_mantenimiento);
                      return (
                        <tr key={cabana.id_cabana} className="hover:bg-gray-50">
                          {/* Cabaña */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Home size={18} className="text-orange-600" />
                              <div>
                                <div className="text-sm font-bold text-gray-900">{cabana.cod_cabana}</div>
                                <div className="text-xs text-gray-500">ID: {cabana.id_cabana}</div>
                              </div>
                            </div>
                          </td>

                          {/* Tipo */}
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {cabana.nom_tipo_cab}
                          </td>

                          {/* Zona */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                              <MapPin size={14} className="text-gray-500" />
                              {cabana.nom_zona}
                            </div>
                          </td>

                          {/* Capacidad */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-gray-900">
                              <Users size={14} className="text-gray-500" />
                              {cabana.capacidad}
                            </div>
                          </td>

                          {/* Precio */}
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            ${cabana.precio_noche?.toLocaleString()}
                          </td>

                          {/* Estado Cabaña */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${estadoCabana.color}`}>
                              {estadoCabana.icon}
                              {estadoCabana.texto}
                            </span>
                          </td>

                          {/* Código Reserva */}
                          <td className="px-6 py-4 text-sm font-medium text-blue-600">
                            {cabana.cod_reserva}
                          </td>

                          {/* Fechas */}
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div>{new Date(cabana.check_in).toLocaleDateString('es-AR')}</div>
                            <div className="text-xs text-gray-500">
                              hasta {new Date(cabana.check_out).toLocaleDateString('es-AR')}
                            </div>
                          </td>

                          {/* Estado Reserva */}
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoReservaBadge(cabana.estado_reserva)}`}>
                              {cabana.estado_reserva}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mensaje inicial */}
      {!searched && !loading && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            Selecciona una Fecha
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Selecciona una fecha en el selector de arriba y haz clic en "Consultar" para ver qué cabañas están reservadas.
          </p>
        </div>
      )}
    </div>
  );
}
