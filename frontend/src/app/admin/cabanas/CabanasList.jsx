import { useState, useEffect } from 'react';
import {
  Home, Search, Filter, Plus, Eye, Edit2, Trash2, RefreshCw,
  AlertCircle, Loader2, RotateCcw, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getAllCabanas,
  getCabanaById,
  deleteCabana,
  restaurarCabana,
  getEstadoCabana
} from '../../services/cabanaService';
import { getAllZonas } from '../../services/zonaService';

import CabanaFormModal from './CabanaFormModal';
import CabanaDetailModal from './CabanaDetailModal';

export default function CabanasList() {
  const { token } = useAuth();

  // Estados principales
  const [cabanas, setCabanas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZona, setSelectedZona] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('activas'); // 'activas', 'mantenimiento', 'inactivas', 'todas'

  // Estados de modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCabana, setSelectedCabana] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Cargar zonas al montar
  useEffect(() => {
    if (token) {
      loadZonas();
    }
  }, [token]);

  // Cargar cabañas al montar y cuando cambien los filtros
  useEffect(() => {
    if (token) {
      loadCabanas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZona, selectedEstado, token]);

  /**
   * Cargar zonas disponibles
   */
  const loadZonas = async () => {
    try {
      const response = await getAllZonas({ esta_activa: true }, token);
      setZonas(response.data || []);
    } catch (err) {
      console.error('Error al cargar zonas:', err);
    }
  };

  /**
   * Cargar cabañas desde el backend
   */
  const loadCabanas = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {};

      // Aplicar filtro de búsqueda por código
      if (searchTerm.trim()) {
        filters.cod_cabana = searchTerm.trim();
      }

      // Aplicar filtro de zona
      if (selectedZona) {
        filters.id_zona = parseInt(selectedZona);
      }

      // Aplicar filtro de estado
      if (selectedEstado === 'activas') {
        filters.esta_activo = true;
        filters.en_mantenimiento = false;
      } else if (selectedEstado === 'mantenimiento') {
        filters.esta_activo = true;
        filters.en_mantenimiento = true;
      } else if (selectedEstado === 'inactivas') {
        filters.esta_activo = false;
      }
      // Si es 'todas', no aplicar filtros de estado

      const response = await getAllCabanas(filters, token);
      setCabanas(response.data || []);
    } catch (err) {
      console.error('Error al cargar cabañas:', err);
      setError('Error al cargar la lista de cabañas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar búsqueda
   */
  const handleSearch = () => {
    loadCabanas();
  };

  /**
   * Limpiar filtros
   */
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedZona('');
    setSelectedEstado('activas');
  };

  /**
   * Refrescar lista
   */
  const handleRefresh = () => {
    loadCabanas();
  };

  /**
   * Abrir modal para crear cabaña
   */
  const handleCreate = () => {
    setSelectedCabana(null);
    setIsEditing(false);
    setShowFormModal(true);
  };

  /**
   * Abrir modal para ver detalle (carga datos completos con reservas)
   */
  const handleViewDetail = async (cabana) => {
    try {
      // Obtener datos completos de la cabaña incluyendo reservas
      const response = await getCabanaById(cabana.id_cabana, token);
      setSelectedCabana(response.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error al cargar detalle de cabaña:', err);
      setError('Error al cargar los detalles de la cabaña');
    }
  };

  /**
   * Abrir modal para editar
   */
  const handleEdit = (cabana) => {
    setSelectedCabana(cabana);
    setIsEditing(true);
    setShowFormModal(true);
  };

  /**
   * Eliminar cabaña (borrado lógico)
   */
  const handleDelete = async (cabana) => {
    if (!window.confirm(`¿Estás seguro de eliminar la cabaña ${cabana.cod_cabana}?\n\nEsta acción marcará la cabaña como inactiva.`)) {
      return;
    }

    try {
      await deleteCabana(cabana.id_cabana, token);
      setSuccess(`Cabaña ${cabana.cod_cabana} eliminada exitosamente`);
      setTimeout(() => setSuccess(null), 3000);
      loadCabanas();
    } catch (err) {
      console.error('Error al eliminar cabaña:', err);
      setError(err.response?.data?.message || 'Error al eliminar la cabaña');
      setTimeout(() => setError(null), 5000);
    }
  };

  /**
   * Restaurar cabaña eliminada
   */
  const handleRestore = async (cabana) => {
    if (!window.confirm(`¿Restaurar la cabaña ${cabana.cod_cabana}?`)) {
      return;
    }

    try {
      await restaurarCabana(cabana.id_cabana, token);
      setSuccess(`Cabaña ${cabana.cod_cabana} restaurada exitosamente`);
      setTimeout(() => setSuccess(null), 3000);
      loadCabanas();
    } catch (err) {
      console.error('Error al restaurar cabaña:', err);
      setError(err.response?.data?.message || 'Error al restaurar la cabaña');
      setTimeout(() => setError(null), 5000);
    }
  };

  /**
   * Callback cuando se guarda el formulario
   */
  const handleFormSave = () => {
    setShowFormModal(false);
    loadCabanas();
  };

  /**
   * Obtener badge de estado de la cabaña
   */
  const getEstadoBadge = (cabana) => {
    const estado = getEstadoCabana(cabana.esta_activo, cabana.en_mantenimiento);
    
    const colors = {
      green: 'bg-green-100 text-green-800 border-green-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      red: 'bg-red-100 text-red-800 border-red-300'
    };

    const icons = {
      green: <CheckCircle size={14} />,
      yellow: <AlertTriangle size={14} />,
      red: <XCircle size={14} />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${colors[estado.color]}`}>
        {icons[estado.color]}
        {estado.texto}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mensajes de éxito/error */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Header con botón crear */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="text-orange-600" size={28} />
            Gestión de Cabañas
          </h2>
          <p className="text-gray-600 mt-1">Administra las cabañas del resort</p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={20} />
          Nueva Cabaña
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <span className="font-semibold text-gray-900">Filtros de Búsqueda</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda por código */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Search size={16} className="inline mr-1" />
              Buscar por Código
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ej: CAB-001"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Filtro por zona */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Filter size={16} className="inline mr-1" />
              Zona
            </label>
            <select
              value={selectedZona}
              onChange={(e) => setSelectedZona(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todas las zonas</option>
              {zonas.map(zona => (
                <option key={zona.id_zona} value={zona.id_zona}>
                  {zona.nom_zona}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Filter size={16} className="inline mr-1" />
              Estado
            </label>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="activas">Solo Activas</option>
              <option value="mantenimiento">En Mantenimiento</option>
              <option value="inactivas">Solo Inactivas</option>
              <option value="todas">Todas</option>
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition text-sm"
          >
            Limpiar Filtros
          </button>

          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition text-sm flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refrescar
          </button>
        </div>
      </div>

      {/* Tabla de cabañas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-orange-600" size={40} />
            <span className="ml-3 text-gray-600">Cargando cabañas...</span>
          </div>
        ) : cabanas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Home size={48} className="mb-3 text-gray-400" />
            <p className="text-lg font-medium">No se encontraron cabañas</p>
            <p className="text-sm">Intenta cambiar los filtros o crear una nueva cabaña</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio/Noche
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoy
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cabanas.map((cabana) => (
                  <tr key={cabana.id_cabana} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{cabana.cod_cabana}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {cabana.nom_tipo_cab}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {cabana.nom_zona}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {cabana.capacidad} personas
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${cabana.precio_noche?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(cabana)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cabana.reservada_hoy ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                          <CheckCircle size={14} />
                          Reservada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
                          Disponible
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(cabana)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(cabana)}
                          className="text-orange-600 hover:text-orange-800 transition"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        {cabana.esta_activo ? (
                          <button
                            onClick={() => handleDelete(cabana)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(cabana)}
                            className="text-green-600 hover:text-green-800 transition"
                            title="Restaurar"
                          >
                            <RotateCcw size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer con total */}
        {!loading && cabanas.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-semibold">{cabanas.length}</span> cabaña(s)
            </p>
          </div>
        )}
      </div>

      {/* Modales */}
      {showFormModal && (
        <CabanaFormModal
          cabana={selectedCabana}
          isEditing={isEditing}
          onClose={() => setShowFormModal(false)}
          onSave={handleFormSave}
        />
      )}

      {showDetailModal && selectedCabana && (
        <CabanaDetailModal
          cabana={selectedCabana}
          onClose={() => setShowDetailModal(false)}
          onEdit={() => {
            setShowDetailModal(false);
            handleEdit(selectedCabana);
          }}
        />
      )}
    </div>
  );
}
