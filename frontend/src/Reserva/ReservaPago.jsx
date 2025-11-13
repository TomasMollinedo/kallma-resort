import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, AlertCircle, Home, Calendar, Users, CreditCard, Lock } from 'lucide-react';
import { crearReserva } from './reservaService';
import { useAuth } from '../app/context/AuthContext';
import { formatIsoDateForDisplay } from '../app/utils/dateUtils';
import Fondo from '../assets/fondo.jpg';

export default function ReservaPago() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token } = useAuth();
  
  const { cabanasSeleccionadas, searchParams, precioTotal, serviciosSeleccionados, precioServicios, datosTarjeta: datosTarjetaGuardados } = location.state || {};

  const [datosTarjeta, setDatosTarjeta] = useState(
    datosTarjetaGuardados || {
      numeroTarjeta: '',
      nombreTitular: '',
      fechaExpiracion: '',
      cvv: ''
    }
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tarjetaValida, setTarjetaValida] = useState(false);
  const [errores, setErrores] = useState({});
  const [touched, setTouched] = useState({
    numeroTarjeta: false,
    nombreTitular: false,
    fechaExpiracion: false,
    cvv: false
  });

  // Calcular totales
  const precioFinal = precioTotal + (precioServicios || 0);
  const montosena = precioFinal * 0.25;
  const saldoPendiente = precioFinal - montosena;
  
  // Calcular noches
  const noches = searchParams ? Math.ceil(
    (new Date(searchParams.check_out) - new Date(searchParams.check_in)) / (1000 * 60 * 60 * 24)
  ) : 0;

  useEffect(() => {
    // Verificar que llegaron los datos necesarios
    if (!cabanasSeleccionadas || !searchParams || precioTotal === undefined) {
      navigate('/reserva');
    }
  }, [cabanasSeleccionadas, searchParams, precioTotal, navigate]);

  const validarCampos = () => {
    const nuevosErrores = {};

    // Validar número de tarjeta
    const numeroLimpio = datosTarjeta.numeroTarjeta.replace(/\s/g, '');
    if (!numeroLimpio.match(/^\d{13,19}$/)) {
      nuevosErrores.numeroTarjeta = 'El número de tarjeta debe tener entre 13 y 19 dígitos.';
    }

    // Validar nombre del titular
    if (!datosTarjeta.nombreTitular.match(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/)) {
      nuevosErrores.nombreTitular = 'El nombre del titular debe tener al menos 2 caracteres y solo puede contener letras y espacios.';
    }

    // Validar fecha de expiración
    const [mes, anio] = datosTarjeta.fechaExpiracion.split('/');
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anioActual = fechaActual.getFullYear() % 100;
    const mesNumero = parseInt(mes, 10);
    const anioNumero = parseInt(anio, 10);
    
    if (!datosTarjeta.fechaExpiracion.match(/^\d{2}\/\d{2}$/)) {
      nuevosErrores.fechaExpiracion = 'El formato de la fecha debe ser MM/AA';
    } else if (mesNumero < 1 || mesNumero > 12) {
      nuevosErrores.fechaExpiracion = 'El mes debe estar entre 01 y 12';
    } else if (anioNumero < anioActual || (anioNumero === anioActual && mesNumero <= mesActual)) {
      nuevosErrores.fechaExpiracion = 'La fecha de vencimiento debe ser posterior al día de hoy.';
    }

    // Validar CVV
    if (!datosTarjeta.cvv.match(/^\d{3,4}$/)) {
      nuevosErrores.cvv = 'El CVV debe tener entre 3 y 4 dígitos.';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChangeTarjeta = (campo, valor) => {
    let valorFormateado = valor;
    
    if (campo === 'numeroTarjeta') {
      valorFormateado = valor.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    } else if (campo === 'fechaExpiracion') {
      valorFormateado = valor.replace(/\D/g, '').replace(/(.{2})/, '$1/').slice(0, 5);
    } else if (campo === 'cvv') {
      valorFormateado = valor.replace(/\D/g, '').slice(0, 4);
    } else if (campo === 'nombreTitular') {
      valorFormateado = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '').toUpperCase();
    }
    
    setDatosTarjeta(prev => ({
      ...prev,
      [campo]: valorFormateado
    }));
    
    // Mark field as touched and validate
    setTouched(prev => ({
      ...prev,
      [campo]: true
    }));
    
    // Validate the current field
    const nuevosErrores = { ...errores };
    
    if (campo === 'numeroTarjeta') {
      const numeroLimpio = valorFormateado.replace(/\s/g, '');
      if (!numeroLimpio.match(/^\d{13,19}$/)) {
        nuevosErrores.numeroTarjeta = 'El número de tarjeta debe tener entre 13 y 19 dígitos.';
      } else {
        delete nuevosErrores.numeroTarjeta;
      }
    } else if (campo === 'nombreTitular') {
      if (!valorFormateado.match(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/)) {
        nuevosErrores.nombreTitular = 'El nombre del titular debe tener al menos 2 caracteres y solo puede contener letras y espacios.';
      } else {
        delete nuevosErrores.nombreTitular;
      }
    } else if (campo === 'fechaExpiracion') {
      const [mes, anio] = valorFormateado.split('/');
      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth() + 1;
      const anioActual = fechaActual.getFullYear() % 100;
      const mesNumero = parseInt(mes, 10);
      const anioNumero = parseInt(anio, 10);
      
      if (!valorFormateado.match(/^\d{2}\/\d{2}$/)) {
        nuevosErrores.fechaExpiracion = 'El formato de la fecha debe ser MM/AA';
      } else if (mesNumero < 1 || mesNumero > 12) {
        nuevosErrores.fechaExpiracion = 'El mes debe estar entre 01 y 12';
      } else if (anioNumero < anioActual || (anioNumero === anioActual && mesNumero <= mesActual)) {
        nuevosErrores.fechaExpiracion = 'La fecha de vencimiento debe ser posterior al día de hoy.';
      } else {
        delete nuevosErrores.fechaExpiracion;
      }
    } else if (campo === 'cvv') {
      if (!valorFormateado.match(/^\d{3,4}$/)) {
        nuevosErrores.cvv = 'El CVV debe tener entre 3 y 4 dígitos.';
      } else {
        delete nuevosErrores.cvv;
      }
    }
    
    setErrores(nuevosErrores);
  };
  useEffect(() => {
  const numeroLimpio = datosTarjeta.numeroTarjeta.replace(/\s/g, '');
  const [mes, anio] = datosTarjeta.fechaExpiracion.split('/');
  const fechaActual = new Date();
  const mesActual = fechaActual.getMonth() + 1;
  const anioActual = fechaActual.getFullYear() % 100;

  const esValida =
    numeroLimpio.match(/^\d{13,19}$/) &&
    datosTarjeta.nombreTitular.match(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/) &&
    datosTarjeta.fechaExpiracion.match(/^\d{2}\/\d{2}$/) &&
    parseInt(anio, 10) >= anioActual &&
    (parseInt(anio, 10) > anioActual || parseInt(mes, 10) > mesActual) &&
    datosTarjeta.cvv.match(/^\d{3,4}$/);

  setTarjetaValida(!!esValida);
}, [datosTarjeta]);


  const handleConfirmar = () => {
    if (!validarCampos()) {
      setError('Por favor, corrija los errores en el formulario.');
      return;
    }

    // Si no está autenticado, guardar el estado y redirigir a login
    if (!isAuthenticated) {
      localStorage.setItem('pendingReservation', JSON.stringify({
        cabanasSeleccionadas,
        searchParams,
        precioTotal,
        serviciosSeleccionados,
        precioServicios,
        datosTarjeta // Guardar datos de tarjeta para después del login
      }));
      navigate('/login', { state: { from: '/reserva/pago' } });
      return;
    }

    // Si está autenticado, crear la reserva directamente
    handleCompletarReserva();
  };

  const handleCompletarReserva = async () => {
    setLoading(true);
    setError(null);

    try {
      const reservaData = {
        check_in: searchParams.check_in,
        check_out: searchParams.check_out,
        cant_personas: searchParams.cant_personas,
        cabanas_ids: cabanasSeleccionadas.map(c => c.id_cabana),
        servicios_ids: serviciosSeleccionados && serviciosSeleccionados.length > 0 ? serviciosSeleccionados : []
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
    navigate('/reserva/servicios', { 
      state: { cabanasSeleccionadas, searchParams, precioTotal } 
    });
  };

  // Si no hay datos, no renderizar nada (el useEffect redirigirá)
  if (!cabanasSeleccionadas || !searchParams || precioTotal === undefined) {
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
              ¡Reserva Confirmada!
            </h2>
            <p className="text-gray-600 text-lg">
              Tu pago de seña ha sido procesado exitosamente.
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="mb-4">
              <p className="text-gray-700 text-sm mb-2">Seña pagada (25%)</p>
              <p className="text-2xl font-bold text-green-600">
                ARS ${montosena.toLocaleString('es-AR')}
              </p>
            </div>
            <div>
              <p className="text-gray-700 text-sm mb-2">Saldo pendiente (75%)</p>
              <p className="text-xl font-semibold text-gray-800">
                ARS ${saldoPendiente.toLocaleString('es-AR')}
              </p>
              <p className="text-xs text-gray-500 mt-1">A pagar al llegar al resort</p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-gray-700 text-sm">
              Recibirás un correo electrónico con los detalles de tu reserva.
            </p>
            <p className="text-gray-700 text-sm mt-2">
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
              Pago de Seña <span className="text-3xl">💳</span>
            </h1>
            <p className="text-gray-700 text-lg">Completa los datos para confirmar tu reserva</p>
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
              <p className="font-semibold mb-1">Error al procesar el pago</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Columna 1 y 2: Formulario de pago */}
          <div className="md:col-span-2">
            {/* Info de seguridad */}
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
              <Lock size={20} className="flex-shrink-0" />
              <p className="text-sm">
                <strong>Pago seguro.</strong> Tus datos están protegidos con encriptación SSL.
              </p>
            </div>

            {/* Formulario de tarjeta */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard size={24} className="text-orange-500" />
                Datos de la Tarjeta
              </h3>

              <div className="space-y-5">
                {/* Número de tarjeta */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de Tarjeta
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={datosTarjeta.numeroTarjeta}
                    onChange={(e) => handleChangeTarjeta('numeroTarjeta', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, numeroTarjeta: true }))}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 outline-none transition text-lg tracking-wider ${
                      errores.numeroTarjeta && touched.numeroTarjeta 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'
                    }`}
                  />
                  {errores.numeroTarjeta && touched.numeroTarjeta && (
                    <p className="text-red-500 text-xs mt-1">{errores.numeroTarjeta}</p>
                  )}
                </div>

                {/* Nombre del titular */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Titular
                  </label>
                  <input
                    type="text"
                    placeholder="NOMBRE APELLIDO"
                    value={datosTarjeta.nombreTitular}
                    onChange={(e) => handleChangeTarjeta('nombreTitular', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, nombreTitular: true }))}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 outline-none transition uppercase ${
                      errores.nombreTitular && touched.nombreTitular 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'
                    }`}
                  />
                  {errores.nombreTitular && touched.nombreTitular && (
                    <p className="text-red-500 text-xs mt-1">{errores.nombreTitular}</p>
                  )}
                </div>

                {/* Fecha y CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fecha de Expiración
                    </label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={datosTarjeta.fechaExpiracion}
                      onChange={(e) => handleChangeTarjeta('fechaExpiracion', e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, fechaExpiracion: true }))}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 outline-none transition text-lg tracking-wider ${
                        errores.fechaExpiracion && touched.fechaExpiracion 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'
                      }`}
                    />
                    {errores.fechaExpiracion && touched.fechaExpiracion && (
                      <p className="text-red-500 text-xs mt-1">{errores.fechaExpiracion}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      value={datosTarjeta.cvv}
                      onChange={(e) => handleChangeTarjeta('cvv', e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, cvv: true }))}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 outline-none transition text-lg tracking-wider ${
                        errores.cvv && touched.cvv 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                          : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'
                      }`}
                    />
                    {errores.cvv && touched.cvv && (
                      <p className="text-red-500 text-xs mt-1">{errores.cvv}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Indicador de validación */}
              {tarjetaValida && (
                <div className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <Check size={20} />
                  <span className="text-sm font-medium">Datos de tarjeta válidos</span>
                </div>
              )}
            </div>
          </div>

          {/* Columna 3: Resumen */}
          <div className="md:col-span-1">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 sticky top-28">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
                Resumen de Pago
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

                {serviciosSeleccionados && serviciosSeleccionados.length > 0 && precioServicios > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Servicios ({serviciosSeleccionados.length})</span>
                    <span className="font-semibold">ARS ${precioServicios.toLocaleString('es-AR')}</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-900">Total Reserva</span>
                    <span className="text-lg font-bold text-gray-900">
                      ARS ${precioFinal.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* Seña a pagar */}
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-orange-900">Seña a Pagar (25%)</span>
                    <span className="text-2xl font-bold text-orange-600">
                      ARS ${montosena.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <p className="text-xs text-orange-700">
                    Pago requerido ahora para confirmar tu reserva
                  </p>
                </div>

                {/* Saldo pendiente */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Saldo Pendiente (75%)</span>
                    <span className="text-sm font-semibold text-gray-700">
                      ARS ${saldoPendiente.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    A pagar al momento del check-in
                  </p>
                </div>
              </div>

              {/* Botón de confirmar */}
              <button
                onClick={handleConfirmar}
                disabled={loading || !tarjetaValida}
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    {isAuthenticated ? 'Confirmar y Pagar' : 'Continuar (Login requerido)'}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                {isAuthenticated 
                  ? 'Al confirmar se procesará el pago de la seña'
                  : 'Necesitas iniciar sesión para confirmar la reserva'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
