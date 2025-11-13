import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Eye, 
  RefreshCw, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageCircle,
  User,
  Mail,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getAllConsultas,
  formatearFechaCorta
} from '../services/consultaService';
import ConsultaDetailModal from './ConsultaDetailModal';
import ResponderConsultaModal from './ResponderConsultaModal';

export default function ConsultasManagement({ onBack }) {
  const { token } = useAuth();
  
  // Estados principales
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState(''); // Mostrar todas por defecto
  const [selectedPeriodo, setSelectedPeriodo] = useState('todo');
  
  // Estados de modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponderModal, setShowResponderModal] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState(null);

  // Cargar consultas al montar y cuando cambien los filtros
  useEffect(() => {
    if (token) {
      loadConsultas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEstado, selectedPeriodo, token]);

  /**
   * Cargar consultas desde el backend
   */
  const loadConsultas = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filterParams = {};
      
      // Aplicar filtro de búsqueda
      if (searchTerm.trim()) {
        filterParams.busqueda = searchTerm.trim();
      }
      
      // Aplicar filtro de estado
      if (selectedEstado !== '') {
        filterParams.estaRespondida = selectedEstado === 'true';
      }
      
      // Aplicar filtro de período
      if (selectedPeriodo !== 'todo') {
        filterParams.periodo = selectedPeriodo;
      }
      
      const response = await getAllConsultas(filterParams, token);
      setConsultas(response.data || []);
    } catch (err) {
      console.error('Error al cargar consultas:', err);
      setError(err.message || 'Error al cargar las consultas');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar búsqueda
   */
  const handleSearch = () => {
    loadConsultas();
  };

  /**
   * Limpiar filtros
   */
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedEstado('');
    setSelectedPeriodo('todo');
  };

  /**
   * Refrescar lista
   */
  const handleRefresh = () => {
    loadConsultas();
  };

  /**
   * Abrir modal para ver detalle
   */
  const handleViewDetail = (consulta) => {
    setSelectedConsulta(consulta);
    setShowDetailModal(true);
  };

  /**
   * Abrir modal para responder
   */
  const handleResponder = (consulta) => {
    setSelectedConsulta(consulta);
    setShowResponderModal(true);
  };

  /**
   * Callback después de responder consulta
   */
  const handleRespuestaExitosa = () => {
    setShowResponderModal(false);
    setShowDetailModal(false);
    setSuccess('Consulta respondida exitosamente. Email enviado al cliente.');
    setTimeout(() => setSuccess(null), 3000);
    loadConsultas();
  };

  /**
   * Limpiar mensajes automáticamente
   */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  /**
   * Obtener badge de estado
   */
  const getStatusBadge = (estaRespondida) => {
    if (estaRespondida) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
          <CheckCircle2 size={14} />
          Respondida
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
        <Clock size={14} />
        Pendiente
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Botón Volver al Dashboard */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-700 hover:text-yellow-500 font-medium transition"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </button>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500 rounded-lg">
                <MessageSquare size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Consultas</h1>
                <p className="text-gray-600">Atiende y responde consultas de clientes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg flex items-start gap-3">
            <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
            <p>{success}</p>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Filter size={20} />
            Filtros de Búsqueda
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda por texto */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar por nombre, email o título
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ej: Juan, juan@mail.com..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                  title="Buscar"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="false">Solo Pendientes</option>
                <option value="true">Solo Respondidas</option>
                <option value="">Todas</option>
              </select>
            </div>

            {/* Filtro por período */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <select
                value={selectedPeriodo}
                onChange={(e) => setSelectedPeriodo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="todo">Todas las fechas</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Última semana</option>
                <option value="mes">Último mes</option>
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition flex items-center gap-2"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refrescar
            </button>
          </div>
        </div>

        {/* Cards de Consultas */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
            <Loader2 size={48} className="animate-spin text-yellow-500 mb-4" />
            <p className="text-gray-600">Cargando consultas...</p>
          </div>
        ) : consultas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-md">
            <MessageCircle size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay consultas</h3>
            <p className="text-gray-500">
              {selectedEstado === 'false'
                ? 'No hay consultas pendientes en este momento.'
                : selectedEstado === 'true'
                ? 'No se encontraron consultas respondidas con los filtros aplicados.'
                : 'No hay consultas registradas en el sistema.'}
            </p>
          </div>
        ) : (
          <>
            {/* Lista de Cards */}
            <div className="space-y-4">
              {consultas.map((consulta) => (
                <div
                  key={consulta.id_consulta}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <div className="p-6">
                    {/* Header del Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        {/* Título y Estado */}
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {consulta.titulo || <span className="text-gray-400 italic">Sin título</span>}
                          </h3>
                          {getStatusBadge(consulta.esta_respondida)}
                        </div>
                        
                        {/* Información del Cliente */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-yellow-600 flex-shrink-0" />
                            <span className="font-medium truncate">{consulta.nom_cli}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-yellow-600 flex-shrink-0" />
                            <span className="truncate">{consulta.email_cli}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-yellow-600 flex-shrink-0" />
                            <span>{formatearFechaCorta(consulta.fecha_consulta)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleViewDetail(consulta)}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition"
                          title="Ver detalle completo"
                        >
                          <Eye size={16} />
                          Ver
                        </button>
                        {!consulta.esta_respondida && (
                          <button
                            onClick={() => handleResponder(consulta)}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 transition"
                            title="Responder consulta"
                          >
                            <MessageCircle size={16} />
                            Responder
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Información de Respuesta (si existe) */}
                    {consulta.esta_respondida && consulta.nombre_operador && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-md">
                        <CheckCircle2 size={14} />
                        <span>Respondida por <span className="font-semibold">{consulta.nombre_operador}</span></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Información de Paginación (preparado para futuro) */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-semibold">{consultas.length}</span> consulta{consultas.length !== 1 ? 's' : ''}
              </p>
              {/* Aquí se agregará la paginación en el futuro */}
              <div className="text-sm text-gray-500">
                {/* Ejemplo: Página 1 de X */}
              </div>
            </div>
          </>
        )}

        {/* Modales */}
        {showDetailModal && selectedConsulta && (
          <ConsultaDetailModal
            consulta={selectedConsulta}
            onClose={() => setShowDetailModal(false)}
            onResponder={() => {
              setShowDetailModal(false);
              handleResponder(selectedConsulta);
            }}
          />
        )}

        {showResponderModal && selectedConsulta && (
          <ResponderConsultaModal
            consulta={selectedConsulta}
            onClose={() => setShowResponderModal(false)}
            onSuccess={handleRespuestaExitosa}
          />
        )}
      </div>
    </div>
  );
}
