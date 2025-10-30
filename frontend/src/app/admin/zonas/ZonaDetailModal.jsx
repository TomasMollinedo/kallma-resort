import { X, Map, Edit2, Home, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getZonaById } from '../../services/zonaService';

export default function ZonaDetailModal({ zona, onClose, onEdit }) {
  const { token } = useAuth();
  const [zonaDetail, setZonaDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadZonaDetail = async () => {
      try {
        // Cargar detalle con contador de cabañas
        const response = await getZonaById(zona.id_zona, token);
        setZonaDetail(response.data);
      } catch (err) {
        console.error('Error al cargar detalle de zona:', err);
        setZonaDetail(zona); // Usar datos básicos si falla
      } finally {
        setLoading(false);
      }
    };

    if (zona) {
      loadZonaDetail();
    }
  }, [zona]);

  if (!zona) return null;

  const displayZona = zonaDetail || zona;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full">
              <Map size={32} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Detalle de la Zona
              </h2>
              <p className="text-orange-100 text-sm">
                ID: #{displayZona.id_zona} - {displayZona.nom_zona}
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
          {loading && (
            <div className="text-center py-4 text-gray-600">
              Cargando información completa...
            </div>
          )}

          {/* Información Principal */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Map size={20} className="text-orange-600" />
              Información de la Zona
            </h3>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre de la Zona
                </label>
                <p className="text-gray-900 text-xl font-medium">{displayZona.nom_zona}</p>
              </div>

              {/* Capacidad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Capacidad de Cabañas
                </label>
                <p className="text-gray-900 text-lg">
                  {displayZona.capacidad_cabanas} cabañas
                </p>
              </div>

              {/* Cabañas actuales (si está disponible) */}
              {displayZona.total_cabanas !== undefined && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Cabañas Activas Actuales
                  </label>
                  <p className="text-gray-900 text-lg font-bold text-orange-600">
                    {displayZona.total_cabanas} de {displayZona.capacidad_cabanas}
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-orange-600 h-3 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (displayZona.total_cabanas / displayZona.capacidad_cabanas) * 100,
                            100
                          )}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {displayZona.capacidad_cabanas - displayZona.total_cabanas > 0
                        ? `${displayZona.capacidad_cabanas - displayZona.total_cabanas} cabañas disponibles para asignar`
                        : 'Capacidad completa'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estado */}
          <div className="bg-blue-50 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estado de la Zona
            </label>
            {displayZona.esta_activa ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-300">
                <CheckCircle size={16} />
                Activa
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-300">
                <XCircle size={16} />
                Inactiva
              </span>
            )}
            <p className="text-sm text-gray-600 mt-2">
              {displayZona.esta_activa
                ? 'La zona está activa y puede tener cabañas asignadas'
                : 'La zona está inactiva y no puede tener nuevas cabañas'}
            </p>
          </div>

          {/* Información adicional */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-orange-900 mb-2">
              📋 Información Adicional
            </h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• <strong>ID de Zona:</strong> #{displayZona.id_zona}</li>
              <li>• <strong>Nombre:</strong> {displayZona.nom_zona}</li>
              <li>• <strong>Capacidad máxima:</strong> {displayZona.capacidad_cabanas} cabañas</li>
              {displayZona.total_cabanas !== undefined && (
                <li>• <strong>Cabañas activas:</strong> {displayZona.total_cabanas}</li>
              )}
            </ul>
          </div>

          {/* Nota sobre auditoría */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Nota:</strong> Las zonas no tienen campos de auditoría (fecha de creación, modificación, usuarios).
              Solo se almacena la información básica de la zona.
            </p>
          </div>

          {/* Alerta si está inactiva */}
          {!displayZona.esta_activa && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>⚠️ Zona Inactiva:</strong> Esta zona ha sido eliminada (borrado lógico).
                No se pueden asignar nuevas cabañas a esta zona. Un administrador puede restaurarla.
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
              Editar Zona
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
