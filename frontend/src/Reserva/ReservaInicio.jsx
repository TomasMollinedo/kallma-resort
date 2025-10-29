import { useState } from 'react';
import { Search, Calendar, Users } from 'lucide-react';
import { consultarDisponibilidad } from './reservaService';
import ReservaResultados from './ReservaResultados';
import Fondo from '../assets/fondo.jpg';

export default function ReservaInicio() {
  const [formData, setFormData] = useState({
    check_in: '',
    check_out: '',
    cant_personas: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cabanas, setCabanas] = useState(null);
  const [searchParams, setSearchParams] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.check_in) {
      newErrors.check_in = 'La fecha de llegada es obligatoria';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkIn = new Date(formData.check_in + 'T00:00:00');
      if (checkIn < today) {
        newErrors.check_in = 'La fecha de llegada no puede ser anterior a hoy';
      }
    }
    
    if (!formData.check_out) {
      newErrors.check_out = 'La fecha de salida es obligatoria';
    } else if (formData.check_in) {
      const checkIn = new Date(formData.check_in + 'T00:00:00');
      const checkOut = new Date(formData.check_out + 'T00:00:00');
      if (checkOut <= checkIn) {
        newErrors.check_out = 'La fecha de salida debe ser posterior a la de llegada';
      }
    }
    
    if (!formData.cant_personas) {
      newErrors.cant_personas = 'La cantidad de personas es obligatoria';
    } else if (parseInt(formData.cant_personas) > 10) {
      newErrors.cant_personas = 'El máximo de personas permitidas es 10';
    } else if (parseInt(formData.cant_personas) <= 0) {
      newErrors.cant_personas = 'Debe ingresar al menos 1 persona';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await consultarDisponibilidad(formData);
      setCabanas(response.data);
      setSearchParams({
        check_in: formData.check_in,
        check_out: formData.check_out,
        cant_personas: parseInt(formData.cant_personas)
      });
    } catch (error) {
      console.error('Error al buscar cabañas:', error);
      if (error.errors) {
        const newErrors = {};
        error.errors.forEach(err => {
          newErrors[err.field] = err.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: error.error || 'Error al buscar disponibilidad. Intente nuevamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Si ya hay resultados, mostrar el componente de resultados
  if (cabanas !== null) {
    return (
      <ReservaResultados 
        cabanas={cabanas}
        searchParams={searchParams}
        onNuevaBusqueda={() => {
          setCabanas(null);
          setSearchParams(null);
        }}
      />
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
      <div className="relative z-10 container mx-auto px-6 max-w-4xl">
        {/* Título */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extrabold text-gray-900 mb-3">
            Reservas <span className="text-4xl">✨</span>
          </h1>
          <p className="text-gray-700 text-xl font-light">Nueva reserva</p>
        </div>

        {/* Panel de búsqueda */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error general */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Campos del formulario */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Fecha llegada */}
              <div>
                <label className="flex items-center text-gray-700 text-sm font-semibold mb-2">
                  <Calendar size={18} className="mr-2" />
                  Fecha llegada
                </label>
                <input
                  type="date"
                  name="check_in"
                  value={formData.check_in}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    errors.check_in ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.check_in && (
                  <p className="text-red-500 text-xs mt-1">{errors.check_in}</p>
                )}
              </div>

              {/* Fecha salida */}
              <div>
                <label className="flex items-center text-gray-700 text-sm font-semibold mb-2">
                  <Calendar size={18} className="mr-2" />
                  Fecha salida
                </label>
                <input
                  type="date"
                  name="check_out"
                  value={formData.check_out}
                  onChange={handleChange}
                  min={formData.check_in || new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    errors.check_out ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.check_out && (
                  <p className="text-red-500 text-xs mt-1">{errors.check_out}</p>
                )}
              </div>

              {/* Personas */}
              <div>
                <label className="flex items-center text-gray-700 text-sm font-semibold mb-2">
                  <Users size={18} className="mr-2" />
                  Personas
                </label>
                <input
                  type="number"
                  name="cant_personas"
                  value={formData.cant_personas}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  placeholder="Máx. 10"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
                    errors.cant_personas ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.cant_personas && (
                  <p className="text-red-500 text-xs mt-1">{errors.cant_personas}</p>
                )}
              </div>
            </div>

            {/* Botón de búsqueda */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Buscar
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Información adicional */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm text-center">
              💡 <strong>Tip:</strong> Las reservas pueden ser de hasta 10 personas. Puedes seleccionar múltiples cabañas para alcanzar la capacidad necesaria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
