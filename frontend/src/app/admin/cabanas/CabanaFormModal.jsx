import { useState, useEffect } from 'react';
import { X, Save, Home, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createCabana, updateCabana, getCabanaById } from '../../services/cabanaService';
import { getAllZonas } from '../../services/zonaService';
import { getAllTiposCabana } from '../../services/tipoCabanaService';

export default function CabanaFormModal({ cabana, isEditing, onClose, onSave }) {
  const { token, user } = useAuth();

  // Estados del formulario
  const [formData, setFormData] = useState({
    cod_cabana: '',
    id_tipo_cab: '',
    id_zona: '',
    en_mantenimiento: false
  });

  // Estados auxiliares
  const [tiposCabana, setTiposCabana] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  // Es operador (solo puede cambiar mantenimiento)
  const isOperador = user?.rol === 'Operador';

  // Cargar tipos de cabaña y zonas al montar
  useEffect(() => {
    if (token) {
      loadTiposCabana();
      loadZonas();
    }

    // Si estamos editando, cargar los datos de la cabaña
    if (isEditing && cabana) {
      setFormData({
        cod_cabana: cabana.cod_cabana || '',
        id_tipo_cab: cabana.id_tipo_cab || '',
        id_zona: cabana.id_zona || '',
        en_mantenimiento: cabana.en_mantenimiento || false
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isEditing, cabana]);

  /**
   * Cargar tipos de cabaña disponibles
   */
  const loadTiposCabana = async () => {
    try {
      const response = await getAllTiposCabana({ esta_activo: true }, token);
      setTiposCabana(response.data || []);
    } catch (err) {
      console.error('Error al cargar tipos de cabaña:', err);
    }
  };

  /**
   * Cargar zonas activas
   */
  const loadZonas = async () => {
    try {
      const response = await getAllZonas({ esta_activa: true }, token);
      setZonas(response.data || []);
    } catch (err) {
      console.error('Error al cargar zonas:', err);
    }
  };

  /**
   * Manejar cambios en los campos del formulario
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

    // Si es operador, solo validar que haya un cambio
    if (isOperador) {
      // Operador solo puede cambiar en_mantenimiento
      return newErrors;
    }

    // Validaciones para Admin
    if (!isEditing) {
      // Al crear, todos los campos son obligatorios
      if (!formData.cod_cabana.trim()) {
        newErrors.cod_cabana = 'El código de cabaña es obligatorio';
      }

      if (!formData.id_tipo_cab) {
        newErrors.id_tipo_cab = 'Debe seleccionar un tipo de cabaña';
      }

      if (!formData.id_zona) {
        newErrors.id_zona = 'Debe seleccionar una zona';
      }
    } else {
      // Al editar, al menos un campo debe cambiar
      const hasChanges = 
        formData.cod_cabana !== cabana.cod_cabana ||
        formData.id_tipo_cab !== cabana.id_tipo_cab ||
        formData.id_zona !== cabana.id_zona ||
        formData.en_mantenimiento !== cabana.en_mantenimiento;

      if (!hasChanges) {
        newErrors.general = 'Debe realizar al menos un cambio';
      }
    }

    setErrors(newErrors);
    return newErrors;
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    // Validar formulario
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.general) {
        setGeneralError(validationErrors.general);
      }
      return;
    }

    setLoading(true);

    try {
      // Preparar datos según el rol
      let dataToSend;

      if (isOperador) {
        // Operador solo puede enviar en_mantenimiento
        dataToSend = {
          en_mantenimiento: formData.en_mantenimiento
        };
      } else if (isEditing) {
        // Admin editando: enviar solo campos modificados
        dataToSend = {};
        if (formData.cod_cabana !== cabana.cod_cabana) dataToSend.cod_cabana = formData.cod_cabana;
        if (formData.id_tipo_cab !== cabana.id_tipo_cab) dataToSend.id_tipo_cab = parseInt(formData.id_tipo_cab);
        if (formData.id_zona !== cabana.id_zona) dataToSend.id_zona = parseInt(formData.id_zona);
        if (formData.en_mantenimiento !== cabana.en_mantenimiento) dataToSend.en_mantenimiento = formData.en_mantenimiento;
      } else {
        // Admin creando: enviar campos obligatorios
        dataToSend = {
          cod_cabana: formData.cod_cabana.trim(),
          id_tipo_cab: parseInt(formData.id_tipo_cab),
          id_zona: parseInt(formData.id_zona)
        };
      }

      if (isEditing) {
        await updateCabana(cabana.id_cabana, dataToSend, token);
      } else {
        await createCabana(dataToSend, token);
      }

      onSave();
    } catch (err) {
      console.error('Error al guardar cabaña:', err);
      setGeneralError(err.response?.data?.message || 'Error al guardar la cabaña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full">
              <Home size={24} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? 'Editar Cabaña' : 'Nueva Cabaña'}
              </h2>
              <p className="text-orange-100 text-sm">
                {isEditing ? `Código: ${cabana?.cod_cabana}` : 'Complete los datos de la cabaña'}
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error general */}
          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              {generalError}
            </div>
          )}

          {/* Nota para operador */}
          {isOperador && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">
                ℹ️ Como Operador, solo puedes cambiar el estado de mantenimiento
              </p>
            </div>
          )}

          {/* Código de cabaña (solo Admin, solo al crear) */}
          {!isOperador && !isEditing && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código de Cabaña *
              </label>
              <input
                type="text"
                name="cod_cabana"
                value={formData.cod_cabana}
                onChange={handleChange}
                placeholder="Ej: CAB-001"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.cod_cabana ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cod_cabana && (
                <p className="text-red-600 text-sm mt-1">{errors.cod_cabana}</p>
              )}
            </div>
          )}

          {/* Código de cabaña (solo lectura al editar) */}
          {!isOperador && isEditing && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código de Cabaña
              </label>
              <input
                type="text"
                name="cod_cabana"
                value={formData.cod_cabana}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          )}

          {/* Tipo de cabaña (solo Admin) */}
          {!isOperador && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Cabaña *
              </label>
              <select
                name="id_tipo_cab"
                value={formData.id_tipo_cab}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.id_tipo_cab ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione un tipo</option>
                {tiposCabana.map(tipo => (
                  <option key={tipo.id_tipo_cab} value={tipo.id_tipo_cab}>
                    {tipo.nom_tipo_cab} - Capacidad: {tipo.capacidad} - ${tipo.precio_noche?.toLocaleString()}/noche
                  </option>
                ))}
              </select>
              {errors.id_tipo_cab && (
                <p className="text-red-600 text-sm mt-1">{errors.id_tipo_cab}</p>
              )}
            </div>
          )}

          {/* Zona (solo Admin) */}
          {!isOperador && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Zona *
              </label>
              <select
                name="id_zona"
                value={formData.id_zona}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.id_zona ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione una zona</option>
                {zonas.map(zona => (
                  <option key={zona.id_zona} value={zona.id_zona}>
                    {zona.nom_zona}
                  </option>
                ))}
              </select>
              {errors.id_zona && (
                <p className="text-red-600 text-sm mt-1">{errors.id_zona}</p>
              )}
            </div>
          )}

          {/* Estado de mantenimiento (Admin y Operador) */}
          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="en_mantenimiento"
                  checked={formData.en_mantenimiento}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold text-gray-900">Cabaña en Mantenimiento</span>
                  <p className="text-sm text-gray-600">
                    Marcar esta opción cerrará temporalmente la cabaña
                  </p>
                </div>
              </label>
            </div>
          )}


          {/* Botones */}
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
              className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {isEditing ? 'Guardar Cambios' : 'Crear Cabaña'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
