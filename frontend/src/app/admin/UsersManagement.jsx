import { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, Eye, Edit2, Trash2, 
  RefreshCw, ChevronLeft, ChevronRight, AlertCircle,
  UserCheck, UserX, Loader2, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getAllUsers, 
  deleteUser, 
  getRoles 
} from '../services/userService';

import UserFormModal from './components/UserFormModal';
import UserDetailModal from './components/UserDetailModal';
import DeleteConfirmationModal from '../components/modals/DeleteConfirmationModal';
import DependencyErrorModal from '../components/modals/DependencyErrorModal';

export default function UsersManagement({ onBack }) {
  const { token } = useAuth();
  
  // Estados principales
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });
  
  // Estados de filtros y búsqueda
  const [filters, setFilters] = useState({
    nombre: '',
    email: '',
    dni: '',
    rol: '',
    esta_activo: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRol, setSelectedRol] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('true'); // Por defecto: Activos
  
  // Estados de modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dependencyInfo, setDependencyInfo] = useState({ count: 0, type: 'reservas' });

  // Cargar usuarios al montar y cuando cambien los filtros
  useEffect(() => {
    if (token) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.offset, selectedRol, selectedStatus, token]);

  /**
   * Cargar usuarios desde el backend
   */
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filterParams = {
        limit: pagination.limit,
        offset: pagination.offset
      };
      
      // Aplicar filtros de búsqueda
      if (searchTerm.trim()) {
        // Detectar tipo de búsqueda
        if (searchTerm.includes('@')) {
          filterParams.email = searchTerm.trim();
        } else if (/^\d+$/.test(searchTerm.trim())) {
          filterParams.dni = searchTerm.trim();
        } else {
          filterParams.nombre = searchTerm.trim();
        }
      }
      
      // Aplicar filtro de rol
      if (selectedRol) {
        filterParams.rol = selectedRol;
      }
      
      // Aplicar filtro de estado
      if (selectedStatus !== '') {
        filterParams.esta_activo = selectedStatus === 'true';
      }
      
      const response = await getAllUsers(filterParams, token);
      
      setUsers(response.data || []);
      setPagination(response.pagination || {
        total: 0,
        limit: 20,
        offset: 0,
        hasMore: false
      });
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(err.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar búsqueda
   */
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, offset: 0 }));
    loadUsers();
  };

  /**
   * Limpiar filtros
   */
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRol('');
    setSelectedStatus('true'); // Volver a mostrar activos
    setPagination(prev => ({ ...prev, offset: 0 }));
    // El useEffect se encargará de recargar cuando cambien selectedRol y selectedStatus
  };

  /**
   * Refrescar lista
   */
  const handleRefresh = () => {
    loadUsers();
  };

  /**
   * Paginación anterior
   */
  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit)
      }));
    }
  };

  /**
   * Paginación siguiente
   */
  const handleNextPage = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }));
    }
  };

  /**
   * Abrir modal para crear usuario
   */
  const handleCreate = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setShowFormModal(true);
  };

  /**
   * Abrir modal para ver detalle
   */
  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  /**
   * Abrir modal para editar
   */
  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
    setShowFormModal(true);
  };

  /**
   * Abrir modal de confirmación de desactivación
   */
  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  /**
   * Ejecutar desactivación después de confirmar
   */
  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await deleteUser(selectedUser.id_usuario, token);
      setShowDeleteModal(false);
      setSuccess(`Usuario "${selectedUser.nombre}" desactivado exitosamente`);
      loadUsers();
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error al desactivar usuario:', err);
      setShowDeleteModal(false);
      
      // Detectar error de dependencias
      const errorMessage = err.response?.data?.error || err.message || '';
      const match = errorMessage.match(/(\d+)\s+reserva/);
      
      if (match) {
        const count = parseInt(match[1]);
        setDependencyInfo({ count, type: 'reservas' });
        setShowDependencyModal(true);
      } else {
        setError(errorMessage || 'Error al desactivar el usuario');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Obtener badge de rol
   */
  const getRolBadge = (rol) => {
    const colors = {
      'Administrador': 'bg-purple-100 text-purple-800 border-purple-300',
      'Operador': 'bg-blue-100 text-blue-800 border-blue-300',
      'Cliente': 'bg-green-100 text-green-800 border-green-300'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[rol] || 'bg-gray-100 text-gray-800'}`}>
        {rol}
      </span>
    );
  };

  /**
   * Obtener badge de estado
   */
  const getStatusBadge = (estaActivo) => {
    if (estaActivo) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
          <UserCheck size={14} />
          Activo
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          <UserX size={14} />
          Inactivo
        </span>
      );
    }
  };

  const roles = getRoles();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Botón Volver al Dashboard */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-700 hover:text-orange-500 font-medium transition"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </button>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-lg">
                <Users size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-gray-600">Administra todos los usuarios del sistema</p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              Crear Usuario
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start gap-3">
            <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg flex items-start gap-3">
            <UserCheck size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Éxito</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Buscador */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search size={16} className="inline mr-1" />
                Buscar
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre, email o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition"
                >
                  <Search size={20} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Busca por nombre, email (con @) o DNI (solo números)
              </p>
            </div>

            {/* Filtro de Rol */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Rol
              </label>
              <select
                value={selectedRol}
                onChange={(e) => {
                  setSelectedRol(e.target.value);
                  setPagination(prev => ({ ...prev, offset: 0 }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todos los roles</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.nombre}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro de Estado */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Estado
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPagination(prev => ({ ...prev, offset: 0 }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="true">Solo Activos</option>
                <option value="false">Solo Inactivos</option>
                <option value="">Todos</option>
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition text-sm"
            >
              <RefreshCw size={16} />
              Refrescar
            </button>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Info de resultados */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-semibold">{users.length}</span> de{' '}
              <span className="font-semibold">{pagination.total}</span> usuarios
            </p>
          </div>

          {/* Tabla */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={48} className="animate-spin text-orange-500" />
              <p className="ml-4 text-gray-600">Cargando usuarios...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Users size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg font-semibold">No se encontraron usuarios</p>
              <p className="text-gray-500 text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      DNI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id_usuario} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        #{user.id_usuario}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{user.nombre}</div>
                        <div className="text-xs text-gray-500">{user.telefono || 'Sin teléfono'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {user.dni || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRolBadge(user.rol)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.esta_activo)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetail(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Ver detalle"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          {user.esta_activo && (
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Desactivar"
                            >
                              <Trash2 size={18} />
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

          {/* Paginación */}
          {!loading && users.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {Math.floor(pagination.offset / pagination.limit) + 1} de{' '}
                {Math.ceil(pagination.total / pagination.limit)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.offset === 0}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasMore}
                  className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showFormModal && (
        <UserFormModal
          user={selectedUser}
          isEditing={isEditing}
          onClose={() => setShowFormModal(false)}
          onSuccess={() => {
            setShowFormModal(false);
            setSuccess(isEditing ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
            loadUsers();
            setTimeout(() => setSuccess(null), 3000);
          }}
        />
      )}

      {showDetailModal && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setShowDetailModal(false)}
          onEdit={() => {
            setShowDetailModal(false);
            handleEdit(selectedUser);
          }}
        />
      )}

      {/* Modal de confirmación de desactivación */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Desactivar Usuario"
        message="¿Estás seguro de que deseas desactivar este usuario?"
        itemName={selectedUser?.nombre}
        itemType="usuario"
        confirmButtonText="Desactivar"
        isLoading={isDeleting}
      />

      {/* Modal de error de dependencias */}
      <DependencyErrorModal
        isOpen={showDependencyModal}
        onClose={() => setShowDependencyModal(false)}
        itemName={selectedUser?.nombre || ''}
        itemType="usuario"
        dependencyType={dependencyInfo.type}
        dependencyCount={dependencyInfo.count}
      />
    </div>
  );
}
