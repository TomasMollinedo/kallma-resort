import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerMisReservas } from '../../../Reserva/reservaService';
import { Calendar, Search, Filter, X, Clock, Check, XCircle, Loader2 } from 'lucide-react';

export default function MisReservas({ onClose }) {
  const { token } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    cod_reserva: '',
    estado_operativo: '',
    esta_pagada: '',
    fecha: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados operativos para los filtros
  const estadosOperativos = [
    { id: '', nombre: 'Todos los estados' },
    { id: '2', nombre: 'Confirmada' },
    { id: '1', nombre: 'Cancelada' },
    { id: '3', nombre: 'No aparecio' },
    { id: '4', nombre: 'Finalizada' }
  ];

  const estadosPago = [
    { id: '', nombre: 'Todos' },
    { id: 'true', nombre: 'Pagada' },
    { id: 'false', nombre: 'Pendiente' }
  ];

  // Obtener reservas al cargar el componente
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        console.log('Iniciando carga de reservas...');
        console.log('Token:', token);
        setLoading(true);
        const data = await obtenerMisReservas(token);
        console.log('Reservas obtenidas:', data);
        console.log('Tipo de data:', typeof data, 'Es array:', Array.isArray(data));
        
        // Asegurarnos de que siempre tengamos un array
        if (Array.isArray(data)) {
          setReservas(data);
        } else if (data && Array.isArray(data.data)) {
          // El backend devuelve { data: [...], ok: true, total: N }
          console.log('Reservas encontradas:', data.data.length);
          console.log('Primera reserva completa:', JSON.stringify(data.data[0], null, 2));
          setReservas(data.data);
        } else if (data && Array.isArray(data.reservas)) {
          setReservas(data.reservas);
        } else if (data && typeof data === 'object') {
          console.log('Data es un objeto sin array, mostrando vacío');
          setReservas([]);
        } else {
          setReservas([]);
        }
      } catch (err) {
        console.error('Error al obtener reservas:', err);
        setError('No se pudieron cargar las reservas. Intente nuevamente.');
        setReservas([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchReservas();
    } else {
      setError('No hay token de autenticación disponible.');
      setLoading(false);
    }
  }, [token]);

  // Filtrar reservas según los filtros aplicados
  const filteredReservas = Array.isArray(reservas) ? reservas.filter(reserva => {
    return (
      (filters.cod_reserva === '' || 
       reserva.cod_reserva?.toLowerCase().includes(filters.cod_reserva.toLowerCase())) &&
      (filters.estado_operativo === '' || 
       reserva.id_est_op?.toString() === filters.estado_operativo) &&
      (filters.esta_pagada === '' || 
       reserva.esta_pagada?.toString() === filters.esta_pagada) &&
      (filters.fecha === '' || 
       reserva.check_in?.includes(filters.fecha) ||
       reserva.check_out?.includes(filters.fecha))
    );
  }) : [];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      cod_reserva: '',
      estado_operativo: '',
      esta_pagada: '',
      fecha: ''
    });
  };

  const getPagoBadge = (estaPagada) => {
    return estaPagada ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
        <Check size={14} /> Pagada
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <Clock size={14} /> Pendiente
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    try {
      const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 rounded-xl shadow-lg p-8">
        <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="animate-spin h-12 w-12 text-blue-500 mb-4" />
          <span className="text-lg font-medium text-gray-700">Cargando reservas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-blue-50 rounded-xl shadow-lg p-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error al cargar las reservas</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header de la sección */}
      <div className="bg-blue-500 px-6 py-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="text-white" size={28} />
          Mis Reservas
        </h2>
        <button
          onClick={onClose}
          className="text-white hover:bg-blue-600 p-2 rounded-full transition"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>
      </div>

      {/* Filtros */}
      <div className="p-4 bg-blue-50 border-b border-blue-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              name="cod_reserva"
              value={filters.cod_reserva}
              onChange={handleFilterChange}
              placeholder="Buscar por código de reserva"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filtros
            </button>
            {(filters.estado_operativo || filters.esta_pagada || filters.fecha) && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X size={16} className="mr-1" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Filtros desplegables */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label htmlFor="estado_operativo" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="estado_operativo"
                name="estado_operativo"
                value={filters.estado_operativo}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {estadosOperativos.map(estado => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="esta_pagada" className="block text-sm font-medium text-gray-700 mb-1">
                Estado de pago
              </label>
              <select
                id="esta_pagada"
                name="esta_pagada"
                value={filters.esta_pagada}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {estadosPago.map(estado => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha específica
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={filters.fecha}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              />
            </div>
          </div>
        )}
      </div>

      {/* Lista de reservas */}
      <div className="overflow-x-auto bg-white">
        {filteredReservas.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas</h3>
            <p className="text-gray-500">
              {reservas.length === 0 
                ? 'Aún no has realizado ninguna reserva.'
                : 'No se encontraron reservas que coincidan con los filtros seleccionados.'}
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cabaña
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pago
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservas.map((reserva) => (
                <tr key={reserva.id_reserva} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reserva.cod_reserva || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reserva.cantidad_cabanas ? `${reserva.cantidad_cabanas} Cabaña${reserva.cantidad_cabanas > 1 ? 's' : ''}` : 'No especificada'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span>{formatDate(reserva.check_in)}</span>
                      <span className="text-xs text-gray-400">
                        {reserva.noches || 0} noches
                      </span>
                      <span>→ {formatDate(reserva.check_out)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        reserva.estado_operativo === 'Confirmada' 
                          ? 'bg-green-100 text-green-800' 
                          : reserva.estado_operativo === 'Cancelada'
                          ? 'bg-red-100 text-red-800'
                          : reserva.estado_operativo === 'Finalizada'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {reserva.estado_operativo || 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPagoBadge(reserva.esta_pagada)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${parseFloat(reserva.monto_total_res || 0).toLocaleString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
