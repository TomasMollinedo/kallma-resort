import { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createPago, getMediosPago, validatePagoData } from '../../services/pagoService';

/**
 * Modal para registrar un nuevo pago para una reserva
 * Incluye validaciones para evitar sobrepagos y pagos en reservas no activas
 */
export default function PaymentFormModal({ reserva, onClose, onSuccess }) {
  const { token } = useAuth();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    monto: '',
    id_medio_pago: '',
    fecha_pago: new Date().toISOString().split('T')[0] // Fecha actual por defecto
  });

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  // Calcular saldo pendiente
  const saldoPendiente = parseFloat(reserva.monto_total_res) - parseFloat(reserva.monto_pagado);

  // Medios de pago
  const mediosPago = getMediosPago();

  /**
   * Validar que la reserva permita registrar pagos
   */
  useEffect(() => {
    const estadosNoPermitidos = ['Cancelada', 'Finalizada', 'No aparecio'];
    if (estadosNoPermitidos.includes(reserva.estado_operativo)) {
      setErrors([`No se puede registrar un pago para una reserva con estado "${reserva.estado_operativo}"`]);
    }
  }, [reserva]);

  /**
   * Manejar cambios en los campos
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores del campo Y del array general
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Limpiar errores generales al cambiar cualquier campo
    setErrors([]);
  };

  /**
   * Validar el formulario antes de enviar
   */
  const validateForm = () => {
    const newErrors = {};
    const errorList = [];

    // Validar monto
    const monto = parseFloat(formData.monto);
    if (!formData.monto || isNaN(monto) || monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a cero';
      errorList.push('El monto debe ser mayor a cero');
    } else if (monto > saldoPendiente) {
      newErrors.monto = `El monto excede el saldo pendiente (ARS $${saldoPendiente.toLocaleString()})`;
      errorList.push(`El monto excede el saldo pendiente de ARS $${saldoPendiente.toLocaleString()}`);
    }

    // Validar método de pago
    if (!formData.id_medio_pago) {
      newErrors.id_medio_pago = 'Debe seleccionar un método de pago';
      errorList.push('Debe seleccionar un método de pago');
    }

    // Validar fecha
    if (formData.fecha_pago) {
      const fechaPago = new Date(`${formData.fecha_pago}T00:00:00`);
      fechaPago.setHours(0, 0, 0, 0);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const checkInDate = reserva.check_in ? new Date(`${reserva.check_in}T00:00:00`) : null;
      if (checkInDate) {
        checkInDate.setHours(0, 0, 0, 0);
      }

      if (fechaPago > hoy) {
        newErrors.fecha_pago = 'La fecha no puede ser en el futuro';
        errorList.push('La fecha de pago no puede ser en el futuro');
      } else if (checkInDate && fechaPago < checkInDate) {
        newErrors.fecha_pago = 'La fecha debe ser igual o posterior al check-in';
        errorList.push('La fecha del pago debe ser igual o posterior al check-in de la reserva');
      }
    }

    setFieldErrors(newErrors);
    setErrors(errorList);
    return errorList.length === 0;
  };

  /**
   * Enviar formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones del lado del cliente
    if (!validateForm()) {
      return;
    }

    // Validar estado de la reserva
    const estadosNoPermitidos = ['Cancelada', 'Finalizada', 'No aparecio'];
    if (estadosNoPermitidos.includes(reserva.estado_operativo)) {
      setErrors([`No se puede registrar un pago para una reserva con estado "${reserva.estado_operativo}"`]);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      // Preparar datos para enviar
      const pagoData = {
        monto: parseFloat(formData.monto),
        id_medio_pago: parseInt(formData.id_medio_pago),
        // Solo enviar fecha si es diferente a hoy
        ...(formData.fecha_pago !== new Date().toISOString().split('T')[0] && { 
          fecha_pago: formData.fecha_pago 
        })
      };

      // Crear pago
      await createPago(reserva.id_reserva, pagoData, token);
      
      // Notificar éxito y cerrar modal
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error al registrar pago:', err);
      
      // Manejar errores específicos del backend
      if (err.response?.data?.message) {
        const message = err.response.data.message;
        
        // Detectar error de sobrepago
        if (message.includes('excede el saldo pendiente')) {
          const match = message.match(/ARS \$([0-9,.]+)/);
          if (match) {
            setFieldErrors({ monto: `Saldo disponible: ARS $${match[1]}` });
          }
        }
        
        setErrors([message]);
      } else {
        setErrors(['Error al registrar el pago. Por favor, intente nuevamente.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full">
              <DollarSign size={32} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Registrar Pago</h2>
              <p className="text-green-100 text-sm">
                Reserva: {reserva.cod_reserva}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-white/20 rounded-lg transition disabled:opacity-50"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Mensajes de error */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Error al registrar pago</p>
                  <ul className="text-sm mt-1 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Información de la Reserva */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <h3 className="font-bold text-gray-900 mb-3">Información de la Reserva</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Monto Total</p>
                <p className="font-semibold text-gray-900 text-lg">
                  ${parseFloat(reserva.monto_total_res).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Pagado</p>
                <p className="font-semibold text-green-700 text-lg">
                  ${parseFloat(reserva.monto_pagado).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Saldo Pendiente</p>
                <p className="font-semibold text-orange-600 text-lg">
                  ${saldoPendiente.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Monto del Pago */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-1" />
              Monto del Pago *
            </label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              step="0.01"
              min="0"
              max={saldoPendiente}
              disabled={loading}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition text-lg font-semibold ${
                fieldErrors.monto
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-green-500'
              }`}
              placeholder="0.00"
            />
            {fieldErrors.monto && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {fieldErrors.monto}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Máximo: ARS ${saldoPendiente.toLocaleString()}
            </p>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <CreditCard size={16} className="inline mr-1" />
              Método de Pago *
            </label>
            <select
              name="id_medio_pago"
              value={formData.id_medio_pago}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                fieldErrors.id_medio_pago
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-green-500'
              }`}
            >
              <option value="">Seleccione un método de pago</option>
              {mediosPago.map(medio => (
                <option key={medio.id} value={medio.id}>
                  {medio.nombre}
                </option>
              ))}
            </select>
            {fieldErrors.id_medio_pago && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {fieldErrors.id_medio_pago}
              </p>
            )}
          </div>

          {/* Fecha del Pago */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Fecha del Pago
            </label>
            <input
              type="date"
              name="fecha_pago"
              value={formData.fecha_pago}
              onChange={handleChange}
              min={reserva.check_in ? reserva.check_in.split('T')[0] : undefined}
              max={new Date().toISOString().split('T')[0]}
              disabled={loading}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                fieldErrors.fecha_pago
                  ? 'border-red-300 focus:ring-red-500 bg-red-50'
                  : 'border-gray-300 focus:ring-green-500'
              }`}
            />
            {fieldErrors.fecha_pago && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {fieldErrors.fecha_pago}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Si no especifica, se usará la fecha actual
            </p>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Información:</strong> Al registrar el pago, el saldo de la reserva se actualizará automáticamente. 
              Si el monto pagado alcanza o supera el monto total, la reserva se marcará como "Pagada".
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                Registrando...
              </span>
            ) : (
              'Registrar Pago'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
