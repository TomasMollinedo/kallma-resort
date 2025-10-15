import React from 'react';
import { Sparkles, HeartHandshake, Utensils, Zap } from 'lucide-react';

// Este es un componente de página temporal simple para asegurar que el router funcione.
// Reemplázalo con tu contenido real de Servicios cuando esté listo.

export default function ServiciosPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      
      {/* Contenedor Principal Centrado */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden p-8 sm:p-12">
        
        {/* Encabezado */}
        <header className="text-center mb-10">
          <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold text-gray-900">Nuestros Servicios</h1>
          <p className="mt-2 text-xl text-gray-600">
            Estamos preparando algo especial para ti.
          </p>
        </header>

        {/* Contenido Temporal */}
        <div className="space-y-8">
          
          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200 flex items-center space-x-4">
            <HeartHandshake className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Pronto: Hospitalidad Excepcional</h2>
              <p className="mt-1 text-gray-500">
                Nos enfocamos en la comodidad y la atención personalizada para que tu descanso sea inolvidable.
              </p>
            </div>
          </div>

          <div className="p-6 bg-yellow-50 rounded-2xl border border-yellow-200 flex items-center space-x-4">
            <Utensils className="w-8 h-8 text-yellow-600 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Pronto: Gastronomía Local</h2>
              <p className="mt-1 text-gray-500">
                Deléitate con sabores únicos y platillos regionales preparados con ingredientes frescos.
              </p>
            </div>
          </div>
          
          <div className="p-6 bg-green-50 rounded-2xl border border-green-200 flex items-center space-x-4">
            <Zap className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Pronto: Conexión y Naturaleza</h2>
              <p className="mt-1 text-gray-500">
                Servicios pensados para complementar tu experiencia de relax y aventura en la montaña.
              </p>
            </div>
          </div>

        </div>

        {/* Llamada a la acción (CTA) */}
        <div className="mt-10 text-center">
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-md text-white bg-blue-500 hover:bg-blue-600 transition duration-300"
          >
            Volver a la Página Principal
          </a>
        </div>

      </div>
    </div>
  );
}
