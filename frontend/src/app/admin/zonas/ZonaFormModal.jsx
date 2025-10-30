import { useState, useEffect } from 'react';
import { X, Save, Map, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createZona, updateZona } from '../../services/zonaService';

export default function ZonaFormModal({ zona, isEditing, onClose, onSave }) {
  const { token } = useAuth();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    nom_zona: '',
    capacidad_cabanas: ''
  });

  // Estados auxiliares
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  // Cargar datos de la zona si estamos editando
  useEffect(() => {
    if (isEditing && zona) {
      setFormData({
        nom_zona: zona.nom_zona || '',
        capacidad_cabanas: zona.capacidad_cabanas?.toString() || ''
      });
    }
  }, [isEditing, zona]);

  /**
   * Manejar cambios en los campos del formulario
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.nom_zona.trim()) {
      newErrors.nom_zona = 'El nombre de la zona es obligatorio';
    } else if (formData.nom_zona.trim().length < 3) {
      newErrors.nom_zona = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nom_zona.trim().length > 200) {
      newErrors.nom_zona = 'El nombre no puede exceder 200 caracteres';
    }

    if (!formData.capacidad_cabanas) {
      newErrors.capacidad_cabanas = 'La capacidad es obligatoria';
    } else {
      const capacidad = parseInt(formData.capacidad_cabanas);
      if (isNaN(capacidad) || capacidad < 0) {
        newErrors.capacidad_cabanas = 'La capacidad debe ser un número mayor o igual a 0';
      }
    }

    // Si estamos editando, verificar que haya cambios
    if (isEditing) {
      const hasChanges =
        formData.nom_zona.trim() !== zona.nom_zona ||
        parseInt(formData.capacidad_cabanas) !== zona.capacidad_cabanas;

      if (!hasChanges && Object.keys(newErrors).length === 0) {
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
      const dataToSend = {
        nom_zona: formData.nom_zona.trim(),
        capacidad_cabanas: parseInt(formData.capacidad_cabanas)
      };

      if (isEditing) {
        await updateZona(zona.id_zona, dataToSend, token);
      } else {
        await createZona(dataToSend, token);
      }

      onSave();
    } catch (err) {
      console.error('Error al guardar zona:', err);
      setGeneralError(err.response?.data?.message || 'Error al guardar la zona');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-full">
              <Map size={24} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEditing ? 'Editar Zona' : 'Nueva Zona'}
              </h2>
              <p className="text-orange-100 text-sm">
                {isEditing ? `${zona?.nom_zona}` : 'Complete los datos de la zona'}
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

          {/* Nombre de la zona */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de la Zona *
            </label>
            <input
              type="text"
              name="nom_zona"
              value={formData.nom_zona}
              onChange={handleChange}
              placeholder="Ej: Zona Norte, Zona Sur, etc."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.nom_zona ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={200}
            />
            {errors.nom_zona && (
              <p className="text-red-600 text-sm mt-1">{errors.nom_zona}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.nom_zona.length}/200 caracteres
            </p>
          </div>

          {/* Capacidad de cabañas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Capacidad de Cabañas *
            </label>
            <input
              type="number"
              name="capacidad_cabanas"
              value={formData.capacidad_cabanas}
              onChange={handleChange}
              placeholder="Ej: 10"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                errors.capacidad_cabanas ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.capacidad_cabanas && (
              <p className="text-red-600 text-sm mt-1">{errors.capacidad_cabanas}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Número máximo de cabañas que puede tener esta zona
            </p>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Nota:</strong> Al crear una zona, ésta estará activa por defecto. Puedes desactivarla más tarde si es necesario.
            </p>
          </div>

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
                  {isEditing ? 'Guardar Cambios' : 'Crear Zona'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
