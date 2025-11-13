import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, AlertCircle, Home, Calendar, Users, DollarSign, Loader2 } from 'lucide-react';
import { crearReserva, obtenerServicios } from './reservaService';
import { useAuth } from '../app/context/AuthContext';
import { formatIsoDateForDisplay } from '../app/utils/dateUtils';
import Fondo from '../assets/fondo.jpg';

export default function ReservaServicios() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token, user } = useAuth();
  
  const { cabanasSeleccionadas, searchParams, precioTotal } = location.state || {};

  const [serviciosDisponibles, setServiciosDisponibles] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingServicios, setLoadingServicios] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Calcular noches
  const noches = searchParams ? Math.ceil(
    (new Date(searchParams.check_out) - new Date(searchParams.check_in)) / (1000 * 60 * 60 * 24)
  ) : 0;

  // Verificar que llegaron los datos necesarios
  useEffect(() => {
    if (!cabanasSeleccionadas || !searchParams) {
      navigate('/reserva');
    }
  }, [cabanasSeleccionadas, searchParams, navigate]);

  // Cargar servicios del backend (público - sin autenticación)
  useEffect(() => {
    const cargarServicios = async () => {
      try {
        setLoadingServicios(true);
        const response = await obtenerServicios();
        setServiciosDisponibles(response.data || []);
      } catch (err) {
        console.error('Error al cargar servicios:', err);
        setError('No se pudieron cargar los servicios. Puedes continuar sin ellos.');
      } finally {
        setLoadingServicios(false);
      }
    };

    if (cabanasSeleccionadas && searchParams) {
      cargarServicios();
    }
  }, [cabanasSeleccionadas, searchParams]);

  const toggleServicio = (idServicio) => {
    setServiciosSeleccionados(prev => {
      if (prev.includes(idServicio)) {
        return prev.filter(id => id !== idServicio);
      } else {
        return [...prev, idServicio];
      }
    });
  };

  // Calcular precio de servicios: precio_servicio × noches × cant_personas
  const precioServicios = serviciosSeleccionados.reduce((total, id) => {
    const servicio = serviciosDisponibles.find(s => s.id_servicio === id);
    if (servicio) {
      const precioServicio = parseFloat(servicio.precio_servicio);
      return total + (precioServicio * noches * searchParams.cant_personas);
    }
    return total;
  }, 0);

  const precioFinal = precioTotal + precioServicios;

  const handleContinuarAPago = () => {
    // Navegar a la pantalla de pago con todos los datos
    navigate('/reserva/pago', {
      state: {
        cabanasSeleccionadas,
        searchParams,
        precioTotal,
        serviciosSeleccionados,
        precioServicios
      }
    });
  };

  const handleVolver = () => {
    navigate('/reserva', { 
      state: { searchParams } 
    });
  };

  // Si no hay datos, no renderizar nada (el useEffect redirigirá)
  if (!cabanasSeleccionadas || !searchParams) {
    return null;
  }

  return (
    <div className="relative min-h-screen pt-24 pb-20 font-[Lora]">
      {/* Fondo borroso */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${Fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-2">
              Servicios Adicionales <span className="text-3xl"></span>
            </h1>
            <p className="text-gray-700 text-lg">Opcional - Mejorá tu experiencia</p>
          </div>
          <button
            onClick={handleVolver}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-500 font-medium transition"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Error al procesar la reserva</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Columna 1 y 2: Servicios */}
          <div className="md:col-span-2 space-y-4">
            {loadingServicios ? (
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-12 text-center">
                <Loader2 size={48} className="animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">Cargando servicios disponibles...</p>
              </div>
            ) : serviciosDisponibles.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 text-center">
                <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No hay servicios disponibles en este momento.</p>
                <button
                  onClick={handleContinuarAPago}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-full"
                >
                  Continuar sin servicios
                </button>
              </div>
            ) : (
              serviciosDisponibles.map((servicio) => {
                const isSelected = serviciosSeleccionados.includes(servicio.id_servicio);
              
                return (
                  <div
                    key={servicio.id_servicio}
                    className={`bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 transition-all duration-300 cursor-pointer ${
                      isSelected ? 'ring-4 ring-orange-500' : 'hover:shadow-xl'
                    }`}
                    onClick={() => toggleServicio(servicio.id_servicio)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-4xl"></div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {servicio.nom_servicio}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            Precio por persona por noche: ARS ${parseFloat(servicio.precio_servicio).toLocaleString('es-AR')}
                          </p>
                          <p className="text-orange-500 font-bold">
                            Total: + ARS ${(parseFloat(servicio.precio_servicio) * noches * searchParams.cant_personas).toLocaleString('es-AR')}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ({noches} {noches === 1 ? 'noche' : 'noches'} × {searchParams.cant_personas} {searchParams.cant_personas === 1 ? 'persona' : 'personas'})
                          </p>
                        </div>
                      </div>
                      <button
                        className={`px-4 py-2 rounded-full font-semibold transition-all ${
                          isSelected
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {isSelected ? '✓' : '+'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {!loadingServicios && serviciosDisponibles.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleContinuarAPago}
                  className="text-gray-600 hover:text-gray-800 text-sm underline"
                >
                  Continuar sin servicios adicionales
                </button>
              </div>
            )}
          </div>

          {/* Columna 3: Resumen */}
          <div className="md:col-span-1">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 sticky top-28">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
                Resumen
              </h3>

              {/* Detalles de la reserva */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3 text-sm">
                  <Calendar size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Fechas</p>
                    <p className="text-gray-600">
                      {formatIsoDateForDisplay(searchParams.check_in)} - {formatIsoDateForDisplay(searchParams.check_out)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <Users size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Personas</p>
                    <p className="text-gray-600">{searchParams.cant_personas}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <Home size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Cabañas</p>
                    {cabanasSeleccionadas.map((cabana, idx) => (
                      <p key={idx} className="text-gray-600 text-xs">
                        • {cabana.nom_tipo_cab} ({cabana.cod_cabana})
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desglose de precios */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Cabañas</span>
                  <span className="font-semibold">ARS ${precioTotal.toLocaleString('es-AR')}</span>
                </div>

                {serviciosSeleccionados.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Servicios ({serviciosSeleccionados.length})</span>
                    <span className="font-semibold">ARS ${precioServicios.toLocaleString('es-AR')}</span>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-orange-500">
                    ARS ${precioFinal.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Botón de continuar */}
              <button
                onClick={handleContinuarAPago}
                disabled={loadingServicios}
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <>
                  <Check size={20} />
                  Continuar al Pago →
                </>
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Siguiente: Ingresa los datos de tu tarjeta para pagar la seña
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
