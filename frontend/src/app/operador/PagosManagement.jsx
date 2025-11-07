import { useState, useEffect } from 'react';
import { 
  CreditCard, Search, Filter, Eye, RefreshCw, AlertCircle, Loader2, 
  ArrowLeft, DollarSign, Calendar, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getAllPagos,
  getMediosPago,
  getMedioPagoBadgeColor
} from '../services/pagoService';
import { validateDateRange } from '../utils/dateUtils';
import PaymentDetailModal from '../admin/components/PaymentDetailModal';
import AnularPagoModal from '../admin/components/AnularPagoModal';

export default function PagosManagement({ onBack }) {
  const { token } = useAuth();
  
  // Estados principales
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('true'); // Activos por defecto
  const [selectedMedioPago, setSelectedMedioPago] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  
  // Estados de modales
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [selectedPago, setSelectedPago] = useState(null);

  const mediosPago = getMediosPago();

  // Cargar pagos al montar y cuando cambien los filtros
  useEffect(() => {
    if (token) {
      loadPagos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEstado, selectedMedioPago, fechaDesde, fechaHasta, token]);

  /**
   * Cargar pagos desde el backend
   */
  const loadPagos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filterParams = {};
      
      // Aplicar filtro de búsqueda por código de reserva
      if (searchTerm.trim()) {
        filterParams.cod_reserva = searchTerm.trim();
      }
      
      // Aplicar filtro de estado
      if (selectedEstado !== '') {
        filterParams.esta_activo = selectedEstado;
      }
      
      // Aplicar filtro de medio de pago
      if (selectedMedioPago) {
        filterParams.id_medio_pago = selectedMedioPago;
      }
      
      // Validar rango de fechas antes de aplicar
      if (fechaDesde || fechaHasta) {
        const dateValidation = validateDateRange(fechaDesde, fechaHasta);
        if (!dateValidation.isValid) {
          setError(dateValidation.error);
          setLoading(false);
          return;
        }
      }
      
      // Aplicar filtros de fecha
      if (fechaDesde) {
        filterParams.fecha_desde = fechaDesde;
      }
      if (fechaHasta) {
        filterParams.fecha_hasta = fechaHasta;
      }
      
      const response = await getAllPagos(filterParams, token);
      setPagos(response.data || []);
    } catch (err) {
      console.error('Error al cargar pagos:', err);
      setError(err.message || 'Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar búsqueda
   */
  const handleSearch = () => {
    loadPagos();
  };

  /**
   * Limpiar filtros
   */
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedEstado('true');
    setSelectedMedioPago('');
    setFechaDesde('');
    setFechaHasta('');
  };

  /**
   * Refrescar lista
   */
  const handleRefresh = () => {
    loadPagos();
  };

  /**
   * Abrir modal para ver detalle
   */
  const handleViewDetail = (pago) => {
    setSelectedPago(pago);
    setShowDetailModal(true);
  };

  /**
   * Abrir modal para anular pago
   */
  const handleAnular = (pago) => {
    setSelectedPago(pago);
    setShowAnularModal(true);
  };

  /**
   * Callback después de anular pago
   */
  const handleAnularSuccess = () => {
    setShowAnularModal(false);
    setSuccess('Pago anulado exitosamente');
    setTimeout(() => setSuccess(null), 3000);
    loadPagos();
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Botón Volver al Dashboard */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-700 hover:text-green-500 font-medium transition"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </button>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-lg">
                <CreditCard size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
                <p className="text-gray-600">Administra el historial de pagos de las reservas</p>
              </div>
            </div>
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
            <CreditCard size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Éxito</p>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Buscador por código de reserva */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Search size={16} className="inline mr-1" />
                Buscar por Código de Reserva
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: RES-20250130-00001"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={50}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>

            {/* Filtro de Estado */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Filter size={16} className="inline mr-1" />
                Estado
              </label>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="true">Solo Activos</option>
                <option value="false">Solo Anulados</option>
                <option value="">Todos</option>
              </select>
            </div>

            {/* Filtro de Medio de Pago */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CreditCard size={16} className="inline mr-1" />
                Método de Pago
              </label>
              <select
                value={selectedMedioPago}
                onChange={(e) => setSelectedMedioPago(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todos los métodos</option>
                {mediosPago.map(medio => (
                  <option key={medio.id} value={medio.id}>
                    {medio.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtros de Fecha */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Calendar size={16} className="inline mr-1" />
              Filtros por Fecha de Pago
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Desde</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
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

        {/* Tabla de Pagos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Info de resultados */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-semibold">{pagos.length}</span> pago(s)
            </p>
          </div>

          {/* Tabla */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={48} className="animate-spin text-green-500" />
              <p className="ml-4 text-gray-600">Cargando pagos...</p>
            </div>
          ) : pagos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <CreditCard size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg font-semibold">No se encontraron pagos</p>
              <p className="text-gray-500 text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Reserva
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Método de Pago
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
                  {pagos.map((pago) => (
                    <tr key={pago.id_pago} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(pago.fecha_pago).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{pago.cod_reserva}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(pago.check_in).toLocaleDateString('es-ES')} - {new Date(pago.check_out).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{pago.nombre_cliente}</div>
                        <div className="text-xs text-gray-500">{pago.email_cliente}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          ${parseFloat(pago.monto).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total: ${parseFloat(pago.monto_total_res).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                          getMedioPagoBadgeColor(pago.nom_medio_pago)
                        }`}>
                          <CreditCard size={12} />
                          {pago.nom_medio_pago}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                          pago.esta_activo 
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}>
                          {pago.esta_activo ? 'Activo' : 'Anulado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetail(pago)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Ver detalle"
                          >
                            <Eye size={18} />
                          </button>
                          {pago.esta_activo && pago.estado_reserva === 'Confirmada' && (
                            <button
                              onClick={() => handleAnular(pago)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Anular pago"
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
        </div>
      </div>

      {/* Modales */}
      {showDetailModal && selectedPago && (
        <PaymentDetailModal
          pago={selectedPago}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showAnularModal && selectedPago && (
        <AnularPagoModal
          pago={selectedPago}
          onClose={() => setShowAnularModal(false)}
          onSuccess={handleAnularSuccess}
        />
      )}
    </div>
  );
}
