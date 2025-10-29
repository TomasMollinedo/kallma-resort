import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, AlertCircle, Home, Calendar, Users, DollarSign } from 'lucide-react';
import { crearReserva } from './reservaService';
import { useAuth } from '../app/context/AuthContext';
import Fondo from '../assets/fondo.jpg';

export default function ReservaServicios() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token, user } = useAuth();
  
  const { cabanasSeleccionadas, searchParams, precioTotal } = location.state || {};

  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Servicios disponibles (mock - preparado para integración futura)
  const serviciosDisponibles = [
    {
      id: 1,
      nombre: 'Spa & Wellness',
      descripcion: 'Acceso al spa con masajes relajantes y tratamientos de bienestar',
      precio: 5000,
      icono: '💆'
    },
    {
      id: 2,
      nombre: 'Restaurante Gourmet',
      descripcion: 'Desayuno, almuerzo y cena con menú de autor',
      precio: 8000,
      icono: '🍽️'
    },
    {
      id: 3,
      nombre: 'Excursiones',
      descripcion: 'Guías especializados para trekking y actividades outdoor',
      precio: 6000,
      icono: '🥾'
    }
  ];

  useEffect(() => {
    // Verificar que llegaron los datos necesarios
    if (!cabanasSeleccionadas || !searchParams) {
      navigate('/reserva');
    }

    // Verificar autenticación
    if (!isAuthenticated) {
      // Guardar el estado para retomar después del login
      localStorage.setItem('pendingReservation', JSON.stringify(location.state));
      navigate('/login', { state: { from: '/reserva/servicios' } });
    }
  }, [cabanasSeleccionadas, searchParams, isAuthenticated, navigate, location.state]);

  const toggleServicio = (idServicio) => {
    setServiciosSeleccionados(prev => {
      if (prev.includes(idServicio)) {
        return prev.filter(id => id !== idServicio);
      } else {
        return [...prev, idServicio];
      }
    });
  };

  const precioServicios = serviciosSeleccionados.reduce((total, id) => {
    const servicio = serviciosDisponibles.find(s => s.id === id);
    return total + (servicio ? servicio.precio : 0);
  }, 0);

  const precioFinal = precioTotal + precioServicios;

  const handleCompletarReserva = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/reserva/servicios' } });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reservaData = {
        check_in: searchParams.check_in,
        check_out: searchParams.check_out,
        cant_personas: searchParams.cant_personas,
        cabanas_ids: cabanasSeleccionadas.map(c => c.id_cabana),
        servicios_ids: serviciosSeleccionados.length > 0 ? serviciosSeleccionados : []
      };

      const response = await crearReserva(reservaData, token);
      
      setSuccess(true);
      
      // Limpiar datos guardados
      localStorage.removeItem('pendingReservation');
      
      // Redirigir al dashboard después de 3 segundos
      setTimeout(() => {
        navigate('/dashboard/cliente');
      }, 3000);

    } catch (err) {
      console.error('Error al crear reserva:', err);
      setError(err.error || 'Error al crear la reserva. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
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

  // Pantalla de éxito
  if (success) {
    return (
      <div className="relative min-h-screen pt-24 pb-20 font-[Lora] flex items-center justify-center">
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
        <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-12 max-w-2xl mx-6 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={48} className="text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              ¡Reserva Exitosa!
            </h2>
            <p className="text-gray-600 text-lg">
              Tu reserva ha sido confirmada correctamente.
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-gray-700 mb-2">
              Recibirás un correo electrónico con los detalles de tu reserva.
            </p>
            <p className="text-gray-700">
              Serás redirigido a tu panel en unos segundos...
            </p>
          </div>
        </div>
      </div>
    );
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
              Servicios Adicionales <span className="text-3xl">✨</span>
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
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm">
                ℹ️ <strong>Nota:</strong> La integración completa con servicios está en desarrollo. 
                Estos servicios son de ejemplo y no afectarán tu reserva actual.
              </p>
            </div>

            {serviciosDisponibles.map((servicio) => {
              const isSelected = serviciosSeleccionados.includes(servicio.id);
              
              return (
                <div
                  key={servicio.id}
                  className={`bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 transition-all duration-300 cursor-pointer ${
                    isSelected ? 'ring-4 ring-orange-500' : 'hover:shadow-xl'
                  }`}
                  onClick={() => toggleServicio(servicio.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">{servicio.icono}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {servicio.nombre}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {servicio.descripcion}
                        </p>
                        <p className="text-orange-500 font-bold">
                          + ARS ${servicio.precio.toLocaleString('es-AR')}
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
            })}

            <div className="mt-6 text-center">
              <button
                onClick={() => setServiciosSeleccionados([])}
                className="text-gray-600 hover:text-gray-800 text-sm underline"
              >
                Continuar sin servicios adicionales
              </button>
            </div>
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
                      {new Date(searchParams.check_in).toLocaleDateString('es-AR')} - {new Date(searchParams.check_out).toLocaleDateString('es-AR')}
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

              {/* Botón de confirmar */}
              <button
                onClick={handleCompletarReserva}
                disabled={loading}
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Completar compra
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Al confirmar aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
