import { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, CreditCard, Lock, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createUser, updateUser, getRoles } from '../../services/userService';

export default function UserFormModal({ user, isEditing, onClose, onSuccess }) {
  const { token } = useAuth();
  const roles = getRoles();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    dni: '',
    password: '',
    id_rol_usuario: 1,
    esta_activo: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  // Inicializar formulario con datos del usuario si estamos editando
  useEffect(() => {
    if (isEditing && user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        telefono: user.telefono || '',
        dni: user.dni || '',
        password: '', // No prellenar contraseña
        id_rol_usuario: roles.find(r => r.nombre === user.rol)?.id || 1,
        esta_activo: user.esta_activo !== undefined ? user.esta_activo : true
      });
    }
  }, [user, isEditing]);

  /**
   * Valida cada campo del formulario y determina si se puede enviar.
   * @returns {boolean} true cuando todos los campos cumplen con las reglas.
   */
  /**
   * Valida todos los campos del formulario del modal de usuario.
   * @returns {boolean} true cuando cada campo cumple con las reglas de negocio.
   */
  const validateForm = () => {
    const newErrors = {};
    const trimmedName = (formData.nombre || '').trim();
    const trimmedEmail = (formData.email || '').trim();
    const trimmedPhone = (formData.telefono || '').trim();
    const trimmedDni = (formData.dni || '').trim();
    const passwordValue = formData.password || '';
    
    // Nombre obligatorio
    if (!trimmedName) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (trimmedName.length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z\u00C0-\u00FF\s]+$/.test(trimmedName)) {
      newErrors.nombre = 'El nombre solo puede contener letras y espacios';
    }
    
    // Email obligatorio y formato valido
    if (!trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Ingresa un correo valido';
    }
    
    // Contrasena obligatoria solo al crear
    if (!isEditing) {
      if (!passwordValue) {
        newErrors.password = 'La contrasena es obligatoria';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(passwordValue)) {
        newErrors.password = 'Debe tener al menos 8 caracteres, una mayuscula y una minuscula';
      }
    } else if (passwordValue && !/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(passwordValue)) {
      newErrors.password = 'Debe tener al menos 8 caracteres, una mayuscula y una minuscula';
    }

    // Telefono opcional pero con formato valido
    if (trimmedPhone && !/^\+?(54)?\d{8,}$/.test(trimmedPhone)) {
      newErrors.telefono = 'El telefono debe ser valido y puede incluir el prefijo +54';
    }

    // DNI opcional pero con longitud especifica
    if (trimmedDni && !/^\d{7,8}$/.test(trimmedDni)) {
      newErrors.dni = 'El DNI debe tener entre 7 y 8 digitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  /**
   * Manejar cambios en el formulario
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Enviar formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Preparar datos para enviar
      const dataToSend = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim() || undefined,
        dni: formData.dni.trim() || undefined,
        id_rol_usuario: parseInt(formData.id_rol_usuario)
      };
      
      // Incluir contraseña solo si se proporcionó
      if (formData.password) {
        dataToSend.password = formData.password;
      }
      
      // Incluir estado solo al editar
      if (isEditing) {
        dataToSend.esta_activo = formData.esta_activo;
      }
      
      if (isEditing) {
        await updateUser(user.id_usuario, dataToSend, token);
      } else {
        await createUser(dataToSend, token);
      }
      
      onSuccess();
    } catch (err) {
      console.error('Error al guardar usuario:', err);
      setError(err.message || 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <User size={24} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditing ? `Modificar datos de ${user?.nombre}` : 'Completa los datos del nuevo usuario'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Error general */}
        {error && (
          <div className="mx-6 mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Error al guardar</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              Nombre Completo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.nombre
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
              placeholder="Ej: Juan Pérez"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail size={16} className="inline mr-1" />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
              placeholder="usuario@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Lock size={16} className="inline mr-1" />
              Contraseña {isEditing && '(dejar vacío para no cambiar)'}
              {!isEditing && ' *'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.password
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
              placeholder={isEditing ? 'Dejar vacío para mantener la actual' : 'Mínimo 6 caracteres'}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone size={16} className="inline mr-1" />
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                placeholder="+54 9 11 1234-5678"
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
              )}
            </div>

            {/* DNI */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <CreditCard size={16} className="inline mr-1" />
                DNI
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                placeholder="12345678"
              />
              {errors.dni && (
                <p className="mt-1 text-sm text-red-600">{errors.dni}</p>
              )}
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Shield size={16} className="inline mr-1" />
              Rol *
            </label>
            <select
              name="id_rol_usuario"
              value={formData.id_rol_usuario}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            >
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado (solo al editar) */}
          {isEditing && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="esta_activo"
                  checked={formData.esta_activo}
                  onChange={handleChange}
                  className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-700">Usuario Activo</span>
                  <p className="text-xs text-gray-600">
                    Los usuarios inactivos no pueden iniciar sesión en el sistema
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Nota sobre campos obligatorios */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Los campos marcados con * son obligatorios
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

