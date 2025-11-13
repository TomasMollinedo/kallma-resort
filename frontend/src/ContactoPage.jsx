import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { crearConsulta } from "./app/services/consultaService";
import Fondo from "./assets/fondo.jpg";

function Contacto() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      // Mapear campos del formulario a los esperados por el backend
      const consultaData = {
        nomCli: data.name,
        emailCli: data.email,
        titulo: data.subject || undefined, // Opcional
        mensajeCli: data.message,
      };

      const response = await crearConsulta(consultaData);
      
      setSuccess(response.message || 'Consulta enviada exitosamente. Le responderemos a la brevedad.');
      reset();
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error("Error al enviar consulta:", error);
      const errorMsg = error.message || 'Hubo un error al enviar la consulta. Por favor, intente nuevamente.';
      setError(errorMsg);
      
      // Limpiar mensaje de error después de 5 segundos
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-screen relative flex items-center justify-center overflow-hidden pt-24 pb-12 sm:pt-28"
      // ↑ pt-24 deja espacio para el navbar fijo
    >
      {/* 🌄 Fondo borroso */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${Fondo})`,
          filter: "blur(8px)",
          transform: "scale(1.05)",
        }}
      ></div>

      {/* 🕶️ Overlay oscuro */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* 🧡 Contenido principal */}
      <div className="relative z-10 flex flex-col md:flex-row bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 max-w-5xl w-[90%] md:space-x-6 space-y-8 md:space-y-0">
        {/* 📨 Formulario */}
        <div className="md:w-1/2 w-full flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-orange-600 text-center mb-6">
            Contacto
          </h1>

          {/* Mensajes de éxito y error */}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              {success}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 text-gray-800"
          >
            <div>
              <input
                type="text"
                {...register("name", {
                  required: "El nombre es obligatorio",
                  minLength: {
                    value: 2,
                    message: "El nombre debe tener al menos 2 caracteres",
                  },
                  maxLength: {
                    value: 200,
                    message: "El nombre no puede exceder 200 caracteres",
                  },
                  pattern: {
                    value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
                    message: "Solo se permiten letras y espacios",
                  },
                  validate: {
                    notEmpty: (value) => value.trim().length > 0 || "El nombre no puede estar vacío"
                  }
                })}
                placeholder="Nombre completo *"
                disabled={loading}
                className={`w-full p-2 border rounded-md ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                {...register("email", {
                  required: "El correo es obligatorio",
                  pattern: {
                    value: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
                    message: "El email no tiene un formato válido",
                  },
                  maxLength: {
                    value: 320,
                    message: "El email no puede exceder 320 caracteres",
                  },
                  validate: {
                    notEmpty: (value) => value.trim().length > 0 || "El email no puede estar vacío"
                  }
                })}
                placeholder="Correo electrónico *"
                disabled={loading}
                className={`w-full p-2 border rounded-md ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="text"
                {...register("subject", {
                  maxLength: {
                    value: 250,
                    message: "El asunto no puede exceder 250 caracteres",
                  },
                })}
                placeholder="Asunto (opcional)"
                disabled={loading}
                className={`w-full p-2 border rounded-md ${
                  errors.subject ? "border-red-500" : "border-gray-300"
                } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.subject.message}
                </p>
              )}
            </div>

            <div>
              <textarea
                {...register("message", {
                  required: "El mensaje es obligatorio",
                  minLength: {
                    value: 10,
                    message: "El mensaje debe tener al menos 10 caracteres",
                  },
                  maxLength: {
                    value: 5000,
                    message: "El mensaje no puede exceder 5000 caracteres",
                  },
                  validate: {
                    notEmpty: (value) => value.trim().length >= 10 || "El mensaje debe tener al menos 10 caracteres"
                  }
                })}
                placeholder="Mensaje *"
                rows="5"
                disabled={loading}
                className={`w-full p-2 border rounded-md ${
                  errors.message ? "border-red-500" : "border-gray-300"
                } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              ></textarea>
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                'Enviar Consulta'
              )}
            </button>
          </form>
        </div>

        {/* 🗺️ Mapa */}
        <div className="md:w-1/2 w-full flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-orange-600 text-center mb-4">
            Nuestra ubicación
          </h2>
          <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] rounded-xl overflow-hidden shadow-lg border-0">
            <iframe
              title="Mapa de Ushuaia"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d18400.13797973254!2d-68.34616155424657!3d-54.801912640608116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xbc46b3c20114b6e7%3A0xf7c31a04a0b440f!2sUshuaia%2C%20Tierra%20del%20Fuego!5e0!3m2!1ses-419!2sar!4v1634505599999!5m2!1ses-419!2sar"
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contacto;

