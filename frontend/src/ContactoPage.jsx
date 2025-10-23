import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import Fondo from "./assets/fondo.jpg";

function Contacto() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      alert("Completa todos los campos");
      return;
    }

    if (!validateEmail(formData.email)) {
      alert("Ingresa un correo válido");
      return;
    }

    setSending(true);
    try {
      await emailjs.send(
        "service_zfp766k",
        "template_xc8w33j",
        formData,
        "sgekDpnNSfwLcIszP"
      );
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error al enviar:", error);
      setStatus("error");
    } finally {
      setSending(false);
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
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 text-gray-800"
          >
            <input
              type="text"
              name="name"
              placeholder="Nombre"
              value={formData.name}
              onChange={handleChange}
              className="p-3 rounded-md border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              className="p-3 rounded-md border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <textarea
              name="message"
              placeholder="Escribe tu mensaje..."
              value={formData.message}
              onChange={handleChange}
              className="p-3 rounded-md border border-orange-200 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-orange-400"
            />

            <button
              type="submit"
              disabled={sending}
              className={`p-3 rounded-md text-white font-semibold transition ${
                sending
                  ? "bg-orange-300 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {sending ? "Enviando..." : "Enviar"}
            </button>
          </form>

          {status === "success" && (
            <p className="text-green-600 mt-3 text-center">
              ✅ ¡Correo enviado correctamente!
            </p>
          )}
          {status === "error" && (
            <p className="text-red-600 mt-3 text-center">
              ❌ Ocurrió un error al enviar el correo.
            </p>
          )}
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

