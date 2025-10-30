import { X, User, Mail, Phone, CreditCard, Shield, Calendar, Edit2, UserCheck, UserX } from 'lucide-react';
import { formatearFecha } from '../../services/userService';

export default function UserDetailModal({ user, onClose, onEdit }) {
  if (!user) return null;

  /**
   * Obtener badge de rol con color
   */
  const getRolBadge = (rol) => {
    const colors = {
      'Administrador': 'bg-purple-100 text-purple-800 border-purple-300',
      'Operador': 'bg-blue-100 text-blue-800 border-blue-300',
      'Cliente': 'bg-green-100 text-green-800 border-green-300'
    };
    
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${colors[rol] || 'bg-gray-100 text-gray-800'}`}>
        <Shield size={16} />
        {rol}
      </span>
    );
  };

  /**
   * Obtener badge de estado con color
   */
  const getStatusBadge = (estaActivo) => {
    if (estaActivo) {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-300">
          <UserCheck size={16} />
          Activo
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-300">
          <UserX size={16} />
          Inactivo
        </span>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full">
              <User size={32} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Detalle del Usuario
              </h2>
              <p className="text-orange-100 text-sm">
                ID: #{user.id_usuario}
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
        <div className="p-6 space-y-6">
          {/* Información Principal */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-orange-600" />
              Información Personal
            </h3>
            
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <p className="text-gray-900 text-lg font-medium">{user.nombre}</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Mail size={14} />
                  Email
                </label>
                <p className="text-gray-900">{user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Phone size={14} />
                    Teléfono
                  </label>
                  <p className="text-gray-900">{user.telefono || 'No registrado'}</p>
                </div>

                {/* DNI */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <CreditCard size={14} />
                    DNI
                  </label>
                  <p className="text-gray-900">{user.dni || 'No registrado'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rol y Estado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rol del Usuario
              </label>
              {getRolBadge(user.rol)}
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estado
              </label>
              {getStatusBadge(user.esta_activo)}
            </div>
          </div>

          {/* Información de Auditoría */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-orange-600" />
              Información del Sistema
            </h3>
            
            <div className="space-y-3">
              {/* Fecha de creación del usuario */}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Fecha de Creación</span>
                <span className="text-sm text-gray-900">{formatearFecha(user.fecha_creacion)}</span>
              </div>
              
              {/* Fecha de última modificación - se actualiza cada vez que se edita el usuario */}
              {user.fecha_modific && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Última Modificación</span>
                  <span className="text-sm text-gray-900 font-medium">{formatearFecha(user.fecha_modific)}</span>
                </div>
              )}

              {/* Si nunca fue modificado, mostrar mensaje */}
              {!user.fecha_modific && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Última Modificación</span>
                  <span className="text-sm text-gray-500 italic">Sin modificaciones</span>
                </div>
              )}
            </div>
          </div>

          {/* Descripción del Rol */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-blue-900 mb-2">
              Permisos del Rol "{user.rol}"
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {user.rol === 'Administrador' && (
                <>
                  <li>✅ Gestión completa de usuarios</li>
                  <li>✅ Gestión completa de cabañas</li>
                  <li>✅ Gestión completa de reservas</li>
                  <li>✅ Gestión completa de servicios</li>
                  <li>✅ Acceso a reportes y estadísticas</li>
                </>
              )}
              {user.rol === 'Operador' && (
                <>
                  <li>✅ Gestión de cabañas (estado y disponibilidad)</li>
                  <li>✅ Gestión de reservas (todas)</li>
                  <li>✅ Ver reportes y estadísticas</li>
                  <li>❌ No puede gestionar usuarios</li>
                  <li>❌ No puede eliminar entidades</li>
                </>
              )}
              {user.rol === 'Cliente' && (
                <>
                  <li>✅ Crear y ver sus propias reservas</li>
                  <li>✅ Cancelar sus reservas (24h antes)</li>
                  <li>✅ Ver cabañas y servicios disponibles</li>
                  <li>✅ Actualizar su perfil personal</li>
                  <li>❌ Sin acceso a gestión administrativa</li>
                </>
              )}
            </ul>
          </div>

          {/* Nota de seguridad */}
          {!user.esta_activo && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>⚠️ Usuario Inactivo:</strong> Este usuario no puede iniciar sesión en el sistema.
                Debe ser reactivado por un administrador para poder acceder.
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              <Edit2 size={20} />
              Editar Usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
