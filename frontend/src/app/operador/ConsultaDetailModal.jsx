import { useState, useEffect } from 'react';
import { X, MessageSquare, Calendar, User, Mail, Loader2, AlertCircle, CheckCircle2, Clock, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getConsultaById, formatearFecha } from '../services/consultaService';

/**
 * Modal para mostrar el detalle completo de una consulta
 * Incluye información del cliente, mensaje completo y respuesta si existe
 * Permite responder desde el modal
 */
export default function ConsultaDetailModal({ consulta, onClose, onResponder }) {
  const { token } = useAuth();
  const [fullConsulta, setFullConsulta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (consulta && token) {
      loadFullDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consulta, token]);

  /**
   * Carga el detalle completo de la consulta desde el backend
   */
  const loadFullDetails = async () => {
    try {
      setLoading(true);
      const response = await getConsultaById(consulta.id_consulta, token);
      setFullConsulta(response.data);
    } catch (err) {
      console.error('Error al cargar detalle completo:', err);
      setError('No se pudo cargar el detalle completo de la consulta');
    } finally {
      setLoading(false);
    }
  };

  if (!consulta) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-500 to-yellow-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full">
              <MessageSquare size={32} className="text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Detalle de la Consulta
              </h2>
              <p className="text-yellow-100 text-sm">
                ID: {consulta.id_consulta}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-yellow-500" />
            <p className="ml-4 text-gray-600">Cargando detalles...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        ) : fullConsulta ? (
          <div className="p-6 space-y-6">
            {/* Estado de la Consulta */}
            <div className="flex flex-wrap gap-4 pb-6 border-b border-gray-200">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
                fullConsulta.esta_respondida 
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-300'
              }`}>
                {fullConsulta.esta_respondida ? (
                  <>
                    <CheckCircle2 size={16} />
                    Respondida
                  </>
                ) : (
                  <>
                    <Clock size={16} />
                    Pendiente
                  </>
                )}
              </span>
            </div>

            {/* Información del Cliente */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                Información del Cliente
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <User size={14} />
                      Nombre Completo
                    </label>
                    <p className="text-gray-900 text-lg font-medium">{fullConsulta.nom_cli}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Mail size={14} />
                      Email
                    </label>
                    <p className="text-gray-900 text-lg font-medium">{fullConsulta.email_cli}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar size={14} />
                      Fecha de Consulta
                    </label>
                    <p className="text-gray-900 text-base font-medium">
                      {formatearFecha(fullConsulta.fecha_consulta)}
                    </p>
                  </div>

                  {fullConsulta.titulo && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Título
                      </label>
                      <p className="text-gray-900 text-base font-medium">{fullConsulta.titulo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Consulta del Cliente */}
            <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-yellow-500">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare size={20} className="text-yellow-600" />
                Consulta del Cliente
              </h3>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {fullConsulta.mensaje_cli}
              </p>
            </div>

            {/* Respuesta del Operador (si existe) */}
            {fullConsulta.esta_respondida && fullConsulta.respuesta_op && (
              <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-green-600" />
                    Respuesta del Operador
                  </h3>
                  <span className="text-xs text-gray-600">
                    {formatearFecha(fullConsulta.fecha_respuesta)}
                  </span>
                </div>

                {fullConsulta.nombre_operador && (
                  <p className="text-sm text-green-800 font-semibold mb-3">
                    Respondido por: {fullConsulta.nombre_operador}
                  </p>
                )}

                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {fullConsulta.respuesta_op}
                </p>
              </div>
            )}

            {/* Botón de Responder (solo si no está respondida) */}
            {!fullConsulta.esta_respondida && (
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <MessageCircle size={24} className="text-yellow-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Esta consulta está pendiente de respuesta
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Al responder, se enviará automáticamente un email al cliente con tu respuesta.
                    </p>
                    <button
                      onClick={onResponder}
                      className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold flex items-center gap-2"
                    >
                      <MessageCircle size={20} />
                      Responder Consulta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
