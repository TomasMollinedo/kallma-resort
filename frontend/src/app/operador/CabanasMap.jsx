import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  ChevronDown,
  Home,
  Loader2,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllCabanas } from '../services/cabanaService';
import { getAllZonas } from '../services/zonaService';
import CabanaDetailModal from './components/CabanaDetailModal';

const CABANA_STATUS_CONFIG = {
  available: {
    key: 'available',
    label: 'Activa disponible',
    description: 'Operativa y lista para check-in',
    bubbleClasses: 'bg-green-500 border-green-600 text-white shadow-green-200',
    tagClasses: 'bg-green-100 text-green-700 border-green-200'
  },
  reserved: {
    key: 'reserved',
    label: 'Reservada hoy',
    description: 'Tiene huespedes asignados para la fecha actual',
    bubbleClasses: 'bg-amber-400 border-amber-500 text-amber-900 shadow-amber-100',
    tagClasses: 'bg-amber-100 text-amber-700 border-amber-200'
  },
  maintenance: {
    key: 'maintenance',
    label: 'En mantenimiento',
    description: 'Bloqueada temporalmente por tareas operativas',
    bubbleClasses: 'bg-amber-800 border-amber-900 text-white shadow-amber-200',
    tagClasses: 'bg-amber-50 text-amber-900 border-amber-200'
  },
  inactive: {
    key: 'inactive',
    label: 'Inactiva',
    description: 'Fuera de operacion hasta nuevo aviso',
    bubbleClasses: 'bg-red-500 border-red-600 text-white shadow-red-100',
    tagClasses: 'bg-red-100 text-red-700 border-red-200'
  }
};

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0
});

/**
 * Devuelve la configuracion visual correspondiente al estado de una cabana.
 * @param {Object} cabana - Cabana obtenida desde el backend.
 * @returns {Object} Configuracion del estado visual.
 */
const getCabanaStatus = (cabana) => {
  if (!cabana?.esta_activo) {
    return CABANA_STATUS_CONFIG.inactive;
  }

  if (cabana?.reservada_hoy) {
    return CABANA_STATUS_CONFIG.reserved;
  }

  if (cabana?.en_mantenimiento) {
    return CABANA_STATUS_CONFIG.maintenance;
  }

  return CABANA_STATUS_CONFIG.available;
};

/**
 * Formatea un numero en pesos argentinos.
 * @param {number} value - Valor numerico recibido desde la API.
 * @returns {string} Valor formateado en moneda.
 */
const formatCurrency = (value) => currencyFormatter.format(value ?? 0);

/**
 * Vista de mapa por zonas para que el operador visualice rapidamente el estado de las cabanas.
 * @param {Object} props - Propiedades del componente.
 * @param {Function} props.onBack - Callback para volver al dashboard del operador.
 * @returns {JSX.Element} Vista con selector de zona y mapa visual de cabanas.
 */
export default function CabanasMap({ onBack }) {
  const { token } = useAuth();

  const [zonas, setZonas] = useState([]);
  const [cabanas, setCabanas] = useState([]);
  const [selectedZonaId, setSelectedZonaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCabana, setSelectedCabana] = useState(null);

  /**
   * Obtiene el catalogo de zonas activas y todas las cabanas.
   */
  const fetchData = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const [zonasResponse, cabanasResponse] = await Promise.all([
        getAllZonas({ esta_activa: true }, token),
        getAllCabanas({}, token)
      ]);

      const zonasData = zonasResponse.data || [];
      const cabanasData = cabanasResponse.data || [];

      setZonas(zonasData);
      setCabanas(cabanasData);

      if (!selectedZonaId && zonasData.length > 0) {
        setSelectedZonaId(zonasData[0].id_zona);
      }

      if (
        selectedZonaId &&
        zonasData.length > 0 &&
        !zonasData.some((zona) => zona.id_zona === selectedZonaId)
      ) {
        setSelectedZonaId(zonasData[0].id_zona);
      }
    } catch (err) {
      const backendError = err?.response?.data?.error;
      setError(backendError || 'No pudimos obtener la informacion de cabanas. Intenta nuevamente.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /**
   * Maneja el cambio de zona desde el selector del encabezado.
   * @param {React.ChangeEvent<HTMLSelectElement>} event - Evento del selector.
   */
  const handleZonaChange = (event) => {
    const nuevaZona = parseInt(event.target.value, 10);
    setSelectedZonaId(Number.isNaN(nuevaZona) ? null : nuevaZona);
  };

  /**
   * Ejecuta manualmente la recarga de informacion.
   */
  const handleRefresh = () => {
    fetchData();
  };

  /**
   * Abre el modal con la cabaña seleccionada por el operador.
   * @param {Object} cabanaData - Cabaña clickeada dentro del mapa.
   */
  const handleCabanaClick = (cabanaData) => {
    setSelectedCabana(cabanaData);
  };

  /**
   * Cierra el modal de cabaña y limpia la selección.
   */
  const handleCloseCabanaModal = () => {
    setSelectedCabana(null);
  };

  /**
   * Actualiza el listado en memoria cuando cambian datos de mantenimiento.
   * @param {Object} updatedCabana - Payload devuelto por el backend.
   */
  const handleMaintenanceUpdated = (updatedCabana) => {
    setCabanas((prev) =>
      prev.map((item) =>
        item.id_cabana === updatedCabana.id_cabana
          ? {
              ...item,
              en_mantenimiento: updatedCabana.en_mantenimiento,
              esta_activo: updatedCabana.esta_activo,
              fecha_modific: updatedCabana.fecha_modific
            }
          : item
      )
    );
  };

  /**
   * Devuelve las cabanas pertenecientes a la zona seleccionada.
   */
  const filteredCabanas = useMemo(() => {
    if (!selectedZonaId) {
      return [];
    }
    return cabanas.filter((cabana) => cabana.id_zona === selectedZonaId);
  }, [cabanas, selectedZonaId]);

  /**
   * Calcula un resumen de estados para la zona activa.
   */
  const zonaResumen = useMemo(() => {
    return filteredCabanas.reduce(
      (summary, cabana) => {
        const status = getCabanaStatus(cabana);
        summary[status.key] = (summary[status.key] || 0) + 1;
        summary.total += 1;
        return summary;
      },
      {
        total: 0,
        available: 0,
        reserved: 0,
        maintenance: 0,
        inactive: 0
      }
    );
  }, [filteredCabanas]);

  const selectedZona = zonas.find((zona) => zona.id_zona === selectedZonaId);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-500 font-medium transition"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </button>
        )}

        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 rounded-xl text-white">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mapa Operativo de Cabañas</h1>
              <p className="text-gray-600">
                Visualiza el estado de cada zona y gestiona el mantenimiento rápidamente
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 font-semibold shadow-sm hover:border-orange-200 hover:text-orange-600 disabled:opacity-50"
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </header>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
                Zona seleccionada
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={22} className="text-orange-500" />
                {selectedZona?.nom_zona || 'Sin zonas disponibles'}
              </h2>
              {selectedZona && (
                <p className="text-sm text-gray-500">
                  Capacidad declarada: {selectedZona.capacidad_cabanas} cabaña(s)
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="zonaSelect" className="text-sm font-semibold text-gray-600">
                Cambiar zona
              </label>
              <div className="relative">
                <select
                  id="zonaSelect"
                  value={selectedZonaId ?? ''}
                  onChange={handleZonaChange}
                  className="appearance-none border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 bg-gray-50 text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {zonas.length === 0 && <option value="">Sin zonas</option>}
                  {zonas.map((zona) => (
                    <option key={zona.id_zona} value={zona.id_zona}>
                      {zona.nom_zona}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              </div>
            </div>
          </div>

          {error && (
            <div className="px-6 py-4 flex items-center gap-3 text-sm text-red-700 bg-red-50 border-t border-red-100">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="px-6 py-16 flex flex-col items-center justify-center text-gray-500">
              <Loader2 size={36} className="animate-spin text-orange-500 mb-3" />
              Cargando mapa de cabañas...
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {Object.values(CABANA_STATUS_CONFIG).map((status) => (
                  <div
                    key={status.key}
                    className="bg-gray-50 rounded-xl border border-gray-100 p-5 flex flex-col items-center gap-3"
                  >
                    <div className={`w-12 h-12 rounded-full border ${status.bubbleClasses}`} />
                    <p className="text-sm font-semibold text-gray-600">{status.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {zonaResumen[status.key] || 0}
                    </p>
                  </div>
                ))}
              </div>

              <div className="relative border-2 border-dashed border-gray-200 rounded-2xl min-h-[420px] bg-gradient-to-br from-white to-slate-50 p-6">
                {filteredCabanas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-gray-500 min-h-[320px]">
                    <Home size={40} className="text-gray-300 mb-3" />
                    <p className="text-base font-semibold">
                      Esta zona aun no tiene cabanas registradas.
                    </p>
                    <p className="text-sm">
                      Revisa nuevamente mas tarde o verifica los filtros en el panel de administrador.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12 place-items-center pt-4">
                    {filteredCabanas.map((cabana) => {
                      const status = getCabanaStatus(cabana);
                      return (
                        <div key={cabana.id_cabana} className="group relative flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => handleCabanaClick(cabana)}
                            className="flex flex-col items-center focus:outline-none"
                          >
                            <div
                              className={`w-20 h-20 rounded-2xl border-4 ${status.bubbleClasses} flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}
                            >
                              <Home size={32} className="drop-shadow text-white" />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-700">
                              {cabana.cod_cabana}
                            </p>
                            <span
                              className={`mt-1 text-xs font-semibold px-3 py-1 rounded-full border ${status.tagClasses}`}
                            >
                              {status.label}
                            </span>
                          </button>

                          <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition duration-200 absolute -bottom-4 translate-y-full w-64 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-10">
                            <p className="text-sm font-semibold text-gray-900 mb-2">
                              {cabana.nom_tipo_cab} - {cabana.capacidad} personas
                            </p>
                            <p className="text-xs text-gray-500 mb-2">{status.description}</p>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                <span className="font-semibold">Precio noche:</span>{' '}
                                {formatCurrency(cabana.precio_noche)}
                              </p>
                              <p>
                                <span className="font-semibold">Mantenimiento:</span>{' '}
                                {cabana.en_mantenimiento ? 'Si' : 'No'}
                              </p>
                              <p>
                                <span className="font-semibold">Reservada hoy:</span>{' '}
                                {cabana.reservada_hoy ? 'Si' : 'No'}
                              </p>
                              <p>
                                <span className="font-semibold">Ultima actualizacion:</span>{' '}
                                {cabana.fecha_modific
                                  ? new Date(cabana.fecha_modific).toLocaleString()
                                  : 'Sin cambios'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {selectedCabana && (
          <CabanaDetailModal
            cabana={selectedCabana}
            onClose={handleCloseCabanaModal}
            onMaintenanceChange={handleMaintenanceUpdated}
          />
        )}
      </div>
    </div>
  );
}
