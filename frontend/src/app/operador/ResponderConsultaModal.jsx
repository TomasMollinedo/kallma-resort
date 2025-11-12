import React, { useState } from 'react';
import { X, Send, AlertCircle, User, Mail, MessageSquare, Calendar } from 'lucide-react';
import { responderConsulta, formatearFecha } from '../services/consultaService';

/**
 * Modal para responder una consulta de cliente.
 * El backend enviará automáticamente un email al cliente con la respuesta.
 * @param {Object} props - Props del componente
 * @param {Object} props.consulta - Consulta a responder
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función callback cuando se responde exitosamente
 */
export default function ResponderConsultaModal({ consulta, onClose, onSuccess }) {
  const token = localStorage.getItem('token');

  // Estados del formulario
  const [respuestaOp, setRespuestaOp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validación en tiempo real
  const caracteresRestantes = 5000 - respuestaOp.length;
  const esRespuestaValida = respuestaOp.trim().length >= 10 && respuestaOp.trim().length <= 5000;

  /**
   * Maneja el envío de la respuesta.
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación adicional
    if (!esRespuestaValida) {
      setError('La respuesta debe tener entre 10 y 5000 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await responderConsulta(
        consulta.id_consulta,
        { respuestaOp: respuestaOp.trim() },
        token
      );

      onSuccess('Consulta respondida exitosamente. Se ha enviado un email al cliente.');
    } catch (err) {
      console.error('Error al responder consulta:', err);
      
      // Manejo de errores específicos
      if (err.message && err.message.includes('ya ha sido respondida')) {
        setError('Esta consulta ya ha sido respondida.');
      } else if (err.response?.data?.errors) {
        // Errores de validación del backend
        const erroresValidacion = err.response.data.errors
          .map((e) => e.message)
          .join(', ');
        setError(erroresValidacion);
      } else {
        setError(err.message || 'Error al responder la consulta. Por favor, intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-t-2xl sticky top-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare size={28} />
              Responder Consulta
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-yellow-400 rounded-full transition disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6">
          {/* Información del Cliente */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Información del Cliente</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User size={16} className="text-yellow-600" />
                <span className="font-semibold text-gray-700">Nombre:</span>
                <span className="text-gray-600">{consulta.nom_cli}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-yellow-600" />
                <span className="font-semibold text-gray-700">Email:</span>
                <span className="text-gray-600">{consulta.email_cli}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-yellow-600" />
                <span className="font-semibold text-gray-700">Fecha consulta:</span>
                <span className="text-gray-600">{formatearFecha(consulta.fecha_consulta)}</span>
              </div>
              {consulta.titulo && (
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-yellow-600" />
                  <span className="font-semibold text-gray-700">Título:</span>
                  <span className="text-gray-600">{consulta.titulo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mensaje Original del Cliente */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-600" />
              Consulta del Cliente
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{consulta.mensaje_cli}</p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario de Respuesta */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tu Respuesta *
                <span className="text-xs font-normal ml-2">
                  (Se enviará por email al cliente)
                </span>
              </label>
              <textarea
                value={respuestaOp}
                onChange={(e) => setRespuestaOp(e.target.value)}
                placeholder="Escribe aquí tu respuesta al cliente. Mínimo 10 caracteres..."
                rows="8"
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none ${
                  loading ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${
                  respuestaOp.trim().length > 0 && !esRespuestaValida
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              
              {/* Contador de caracteres */}
              <div className="flex justify-between items-center mt-2 text-sm">
                <span
                  className={`${
                    caracteresRestantes < 100
                      ? 'text-red-600 font-semibold'
                      : 'text-gray-600'
                  }`}
                >
                  {caracteresRestantes} caracteres restantes
                </span>
                <span
                  className={`${
                    respuestaOp.trim().length < 10
                      ? 'text-red-600'
                      : respuestaOp.trim().length >= 10
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}
                >
                  {respuestaOp.trim().length} / 5000
                </span>
              </div>

              {/* Validación visual */}
              {respuestaOp.trim().length > 0 && respuestaOp.trim().length < 10 && (
                <p className="text-red-500 text-sm mt-2">
                  La respuesta debe tener al menos 10 caracteres
                </p>
              )}
              {respuestaOp.trim().length > 5000 && (
                <p className="text-red-500 text-sm mt-2">
                  La respuesta no puede exceder 5000 caracteres
                </p>
              )}
            </div>

            {/* Información sobre el envío de email */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <Mail size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-1">Email Automático</p>
                  <p>
                    Al responder, se enviará automáticamente un correo electrónico a{' '}
                    <span className="font-semibold">{consulta.email_cli}</span> con tu respuesta.
                    El email incluirá la consulta original y tu respuesta.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !esRespuestaValida}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Responder y Enviar Email
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
