import { useState } from 'react';
import { Calendar, Search, Loader2, AlertCircle, Home, MapPin, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCabanasReservadas } from '../../services/cabanaService';
import { formatIsoDateForDisplay } from '../../utils/dateUtils';

export default function CabanasReservadas() {
  const { token } = useAuth();

  // Estados
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [fechaConsultada, setFechaConsultada] = useState(new Date().toISOString().split('T')[0]);
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
    setFechaConsultada(fecha);

    try {
      const response = await getCabanasReservadas(fecha, token);
      // El backend retorna { ok, data, fecha_consultada }
      setCabanas(response?.data || []);
      setFechaConsultada(response?.fecha_consultada || fecha);
    } catch (err) {
      console.error('Error al consultar cabañas reservadas:', err);
      setError(err.message || 'Error al consultar las cabañas reservadas');
      setCabanas([]);
    } finally {
      setLoading(false);
    }
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-gray-600" />
          <span className="font-semibold text-gray-900">Seleccionar Fecha de Consulta</span>
        </div>

        <div className="max-w-md">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fecha a Consultar
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (!loading) {
                    handleConsultar();
                  }
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
                onClick={handleConsultar}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
              >
                <Search size={20} />
              </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            💡 Selecciona la fecha para ver qué cabañas están reservadas
          </p>
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
                No hay cabañas reservadas para el {formatIsoDateForDisplay(fechaConsultada)}
              </p>
            </div>
          ) : (
            <>
              {/* Header de resultados */}
              <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
                <h3 className="font-bold text-blue-900">
                  {cabanas.length} Cabaña{cabanas.length !== 1 ? 's' : ''} Reservada{cabanas.length !== 1 ? 's' : ''} para el {formatIsoDateForDisplay(fechaConsultada)}
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
                        Código Reserva
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Estado Reserva
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Check-in / Check-out
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cabanas.map((cabana) => (
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

                        {/* Código Reserva */}
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">
                          {cabana.cod_reserva}
                        </td>

                        {/* Estado Reserva */}
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoReservaBadge(cabana.estado_reserva)}`}>
                            {cabana.estado_reserva}
                          </span>
                        </td>

                        {/* Fechas */}
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div>{formatIsoDateForDisplay(cabana.check_in)}</div>
                          <div className="text-xs text-gray-500">
                            hasta {formatIsoDateForDisplay(cabana.check_out)}
                          </div>
                        </td>
                      </tr>
                    ))}
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
