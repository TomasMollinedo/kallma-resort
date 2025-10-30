import { useState, useEffect } from 'react';
import {
  Map, Search, Filter, Plus, Eye, Edit2, Trash2, RefreshCw,
  AlertCircle, Loader2, RotateCcw, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getAllZonas,
  deleteZona,
  restaurarZona
} from '../../services/zonaService';

import ZonaFormModal from './ZonaFormModal';
import ZonaDetailModal from './ZonaDetailModal';

export default function ZonasList() {
  const { token } = useAuth();

  // Estados principales
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estados de filtros
  const [selectedEstado, setSelectedEstado] = useState('activas'); // 'activas', 'inactivas', 'todas'

  // Estados de modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedZona, setSelectedZona] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Cargar zonas al montar y cuando cambien los filtros
  useEffect(() => {
    if (token) {
      loadZonas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEstado, token]);

  /**
   * Cargar zonas desde el backend
   */
  const loadZonas = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {};

      // Aplicar filtro de estado
      if (selectedEstado === 'activas') {
        filters.esta_activa = true;
      } else if (selectedEstado === 'inactivas') {
        filters.esta_activa = false;
      }
      // Si es 'todas', no aplicar filtro

      const response = await getAllZonas(filters, token);
      setZonas(response.data || []);
    } catch (err) {
      console.error('Error al cargar zonas:', err);
      setError('Error al cargar la lista de zonas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refrescar lista
   */
  const handleRefresh = () => {
    loadZonas();
  };

  /**
   * Abrir modal para crear zona
   */
  const handleCreate = () => {
    setSelectedZona(null);
    setIsEditing(false);
    setShowFormModal(true);
  };

  /**
   * Abrir modal para ver detalle
   */
  const handleViewDetail = (zona) => {
    setSelectedZona(zona);
    setShowDetailModal(true);
  };

  /**
   * Abrir modal para editar
   */
  const handleEdit = (zona) => {
    setSelectedZona(zona);
    setIsEditing(true);
    setShowFormModal(true);
  };

  /**
   * Eliminar zona (borrado lógico)
   */
  const handleDelete = async (zona) => {
    if (!window.confirm(`¿Estás seguro de eliminar la zona "${zona.nom_zona}"?\n\nEsta acción marcará la zona como inactiva y no podrá tener cabañas activas.`)) {
      return;
    }

    try {
      await deleteZona(zona.id_zona, token);
      setSuccess(`Zona "${zona.nom_zona}" eliminada exitosamente`);
      setTimeout(() => setSuccess(null), 3000);
      loadZonas();
    } catch (err) {
      console.error('Error al eliminar zona:', err);
      setError(err.response?.data?.message || 'Error al eliminar la zona');
      setTimeout(() => setError(null), 5000);
    }
  };

  /**
   * Restaurar zona eliminada
   */
  const handleRestore = async (zona) => {
    if (!window.confirm(`¿Restaurar la zona "${zona.nom_zona}"?`)) {
      return;
    }

    try {
      await restaurarZona(zona.id_zona, token);
      setSuccess(`Zona "${zona.nom_zona}" restaurada exitosamente`);
      setTimeout(() => setSuccess(null), 3000);
      loadZonas();
    } catch (err) {
      console.error('Error al restaurar zona:', err);
      setError(err.response?.data?.message || 'Error al restaurar la zona');
      setTimeout(() => setError(null), 5000);
    }
  };

  /**
   * Callback cuando se guarda el formulario
   */
  const handleFormSave = () => {
    setShowFormModal(false);
    loadZonas();
  };

  /**
   * Obtener badge de estado
   */
  const getEstadoBadge = (estaActiva) => {
    if (estaActiva) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
          <CheckCircle size={14} />
          Activa
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          <XCircle size={14} />
          Inactiva
        </span>
      );
    }
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
            <Map className="text-orange-600" size={28} />
            Gestión de Zonas
          </h2>
          <p className="text-gray-600 mt-1">Administra las zonas del resort</p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={20} />
          Nueva Zona
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <span className="font-semibold text-gray-900">Filtros</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Filtro por estado */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="activas">Solo Activas</option>
              <option value="inactivas">Solo Inactivas</option>
              <option value="todas">Todas</option>
            </select>
          </div>

          {/* Botón refrescar */}
          <div className="pt-6">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <RefreshCw size={18} />
              Refrescar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de zonas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-orange-600" size={40} />
            <span className="ml-3 text-gray-600">Cargando zonas...</span>
          </div>
        ) : zonas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Map size={48} className="mb-3 text-gray-400" />
            <p className="text-lg font-medium">No se encontraron zonas</p>
            <p className="text-sm">Intenta cambiar los filtros o crear una nueva zona</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre de la Zona
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacidad de Cabañas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {zonas.map((zona) => (
                  <tr key={zona.id_zona} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-600">#{zona.id_zona}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">{zona.nom_zona}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {zona.capacidad_cabanas} cabañas
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(zona.esta_activa)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(zona)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(zona)}
                          className="text-orange-600 hover:text-orange-800 transition"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        {zona.esta_activa ? (
                          <button
                            onClick={() => handleDelete(zona)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(zona)}
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
        {!loading && zonas.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando <span className="font-semibold">{zonas.length}</span> zona(s)
            </p>
          </div>
        )}
      </div>

      {/* Modales */}
      {showFormModal && (
        <ZonaFormModal
          zona={selectedZona}
          isEditing={isEditing}
          onClose={() => setShowFormModal(false)}
          onSave={handleFormSave}
        />
      )}

      {showDetailModal && selectedZona && (
        <ZonaDetailModal
          zona={selectedZona}
          onClose={() => setShowDetailModal(false)}
          onEdit={() => {
            setShowDetailModal(false);
            handleEdit(selectedZona);
          }}
        />
      )}
    </div>
  );
}
