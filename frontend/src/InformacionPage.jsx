import React from 'react';
import { Info, MapPin, Mail, Phone, Clock } from 'lucide-react';

// Este es un componente de página temporal para la información y el contacto.
// Úsalo para validar el router mientras preparas el contenido definitivo.

export default function InformacionPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      
      {/* Contenedor Principal Centrado */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden p-8 sm:p-12">
        
        {/* Encabezado */}
        <header className="text-center mb-10">
          <Info className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold text-gray-900">Información y Contacto</h1>
          <p className="mt-2 text-xl text-gray-600">
            Encuentra todos los detalles para planificar tu visita.
          </p>
        </header>

        {/* Contenido Temporal: Bloques de Información */}
        <div className="space-y-8">
          
          {/* Bloque 1: Ubicación */}
          <div className="p-6 bg-gray-100 rounded-2xl border border-gray-200 flex items-start space-x-4">
            <MapPin className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Ubicación</h2>
              <p className="mt-1 text-gray-500">
                Estamos ubicados en la zona montañosa de El Descanso, cerca del Parque Nacional.
                (Dirección exacta pendiente).
              </p>
            </div>
          </div>

          {/* Bloque 2: Contacto */}
          <div className="p-6 bg-gray-100 rounded-2xl border border-gray-200 space-y-4">
            <div className="flex items-center space-x-4">
              <Mail className="w-8 h-8 text-indigo-500 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Correo Electrónico</h2>
                <p className="mt-1 text-gray-500">
                  <a href="mailto:info@kallmacabanas.com" className="hover:underline">info@kallmacabanas.com</a>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 pt-2">
              <Phone className="w-8 h-8 text-green-500 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Teléfono</h2>
                <p className="mt-1 text-gray-500">(+56) 9 1234 5678 (Disponible 9:00 a 18:00)</p>
              </div>
            </div>
          </div>

          {/* Bloque 3: Horarios */}
          <div className="p-6 bg-gray-100 rounded-2xl border border-gray-200 flex items-start space-x-4">
            <Clock className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Horarios de Check-in/out</h2>
              <p className="mt-1 text-gray-500">
                Check-in: 15:00 hrs. | Check-out: 11:00 hrs. (Sujeto a confirmación).
              </p>
            </div>
          </div>
        </div>

        {/* Llamada a la acción (CTA) */}
        <div className="mt-10 text-center">
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-gray-700 hover:bg-gray-800 transition duration-300"
          >
            Volver al Inicio
          </a>
        </div>

      </div>
    </div>
  );
}
