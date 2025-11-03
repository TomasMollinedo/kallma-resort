import React from "react";
import { useForm } from "react-hook-form";
import emailjs from "@emailjs/browser";
import Fondo from "./assets/fondo.jpg";

function Contacto() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await emailjs.send(
        "service_zfp766k",
        "template_xc8w33j",
        data,
        "sgekDpnNSfwLcIszP"
      );
      alert("Mensaje enviado con éxito");
      reset();
    } catch (error) {
      console.error("Error al enviar:", error);
      alert("Hubo un error al enviar el mensaje");
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
                })}
                placeholder="Nombre"
                className={`w-full p-2 border rounded-md ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
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
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Ingresa un correo válido",
                  },
                })}
                placeholder="Correo"
                className={`w-full p-2 border rounded-md ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <textarea
                {...register("message", {
                  required: "El mensaje es obligatorio",
                })}
                placeholder="Mensaje"
                className={`w-full p-2 border rounded-md ${
                  errors.message ? "border-red-500" : "border-gray-300"
                }`}
              ></textarea>
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition"
            >
              Enviar
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

