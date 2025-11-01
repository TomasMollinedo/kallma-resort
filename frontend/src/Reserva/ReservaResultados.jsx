import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, DollarSign, Home } from 'lucide-react';
import Fondo from '../assets/fondo.jpg';
import cabanaEsencialImg from '../assets/Cabana1.webp';
import cabanaConfortImg from '../assets/Cabana2.webp';
import cabanaPremiumImg from '../assets/Cabana3.webp';

export default function ReservaResultados({ cabanas, searchParams, onNuevaBusqueda }) {
  const navigate = useNavigate();
  const [cabanasSeleccionadas, setCabanasSeleccionadas] = useState([]);
  const imagenesPorTipo = {
    Esencial: cabanaEsencialImg,
    Confort: cabanaConfortImg,
    Premium: cabanaPremiumImg,
  };

  // Calcular capacidad total de las cabañas seleccionadas
  const capacidadSeleccionada = cabanasSeleccionadas.reduce(
    (total, id) => {
      const cabana = cabanas.find(c => c.id_cabana === id);
      return total + (cabana ? parseInt(cabana.capacidad) : 0);
    },
    0
  );

  // Calcular precio total
  const precioTotal = cabanasSeleccionadas.reduce(
    (total, id) => {
      const cabana = cabanas.find(c => c.id_cabana === id);
      return total + (cabana ? parseFloat(cabana.precio_total) : 0);
    },
    0
  );

  const toggleCabana = (idCabana) => {
    setCabanasSeleccionadas(prev => {
      if (prev.includes(idCabana)) {
        return prev.filter(id => id !== idCabana);
      } else {
        const cabana = cabanas.find(c => c.id_cabana === idCabana);
        const nuevaCapacidad = capacidadSeleccionada + parseInt(cabana.capacidad);
        
        // Verificar que no se exceda la cantidad de personas buscadas
        if (nuevaCapacidad > searchParams.cant_personas + 5) {
          alert('La capacidad de las cabañas seleccionadas excedería significativamente el número de personas solicitado.');
          return prev;
        }
        
        return [...prev, idCabana];
      }
    });
  };

  const handleSiguiente = () => {
    if (cabanasSeleccionadas.length === 0) {
      alert('Debe seleccionar al menos una cabaña para continuar');
      return;
    }

    if (capacidadSeleccionada < searchParams.cant_personas) {
      alert(`La capacidad seleccionada (${capacidadSeleccionada}) es menor a la cantidad de personas solicitada (${searchParams.cant_personas}). Por favor, seleccione más cabañas.`);
      return;
    }

    // Navegar a la página de servicios con los datos
    navigate('/reserva/servicios', {
      state: {
        cabanasSeleccionadas: cabanasSeleccionadas.map(id => 
          cabanas.find(c => c.id_cabana === id)
        ),
        searchParams,
        precioTotal
      }
    });
  };

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
      <div className="relative z-10 container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-2">
              Cabañas Disponibles <span className="text-3xl">*</span>
            </h1>
            <p className="text-gray-700 text-lg">
              {searchParams.cant_personas} {searchParams.cant_personas === 1 ? 'persona' : 'personas'} • 
              {' '}{searchParams.noches || Math.ceil((new Date(searchParams.check_out) - new Date(searchParams.check_in)) / (1000 * 60 * 60 * 24))} {searchParams.noches === 1 ? 'noche' : 'noches'}
            </p>
          </div>
          <button
            onClick={onNuevaBusqueda}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-500 font-medium transition"
          >
            <ArrowLeft size={20} />
            Nueva búsqueda
          </button>
        </div>

        {/* Mensaje si no hay cabañas */}
        {cabanas.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-12 text-center">
            <Home size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              No hay cabañas disponibles
            </h2>
            <p className="text-gray-600 mb-6">
              No encontramos cabañas disponibles para las fechas seleccionadas.
              Intenta buscar en otras fechas o contacta con nosotros.
            </p>
            <button
              onClick={onNuevaBusqueda}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition"
            >
              Buscar otras fechas
            </button>
          </div>
        ) : (
          <>
            {/* Listado de cabañas */}
            <div className="space-y-6 mb-8">
              {cabanas.map((cabana) => {
                const isSelected = cabanasSeleccionadas.includes(cabana.id_cabana);
                
                return (
                  <div
                    key={cabana.id_cabana}
                    className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                      isSelected ? 'ring-4 ring-orange-500 shadow-2xl' : 'hover:shadow-xl'
                    }`}
                  >
                    <div className="md:flex">
                      {/* Imagen */}
                      <div className="md:w-1/3 h-64 md:h-auto bg-gray-200">
                        {imagenesPorTipo[cabana.nom_tipo_cab] ? (
                          <img
                            src={imagenesPorTipo[cabana.nom_tipo_cab]}
                            alt={`Cabaña ${cabana.nom_tipo_cab}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Home size={64} />
                          </div>
                        )}
                      </div>

                      {/* Información */}
                      <div className="md:w-2/3 p-6 md:p-8">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">
                              {cabana.nom_tipo_cab}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin size={14} />
                              Zona: {cabana.nom_zona} • Código: {cabana.cod_cabana}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm text-gray-600 mb-1">
                              {cabana.noches} {cabana.noches === 1 ? 'noche' : 'noches'}
                            </p>
                            <p className="text-3xl font-bold text-orange-500">
                              ARS ${cabana.precio_total.toLocaleString('es-AR')}
                            </p>
                            <p className="text-xs text-gray-500">
                              ${cabana.precio_noche}/noche
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-gray-700 mb-2">
                            <Users size={18} />
                            <span className="font-semibold">Capacidad máxima:</span>
                            <span>{cabana.capacidad} {cabana.capacidad === 1 ? 'persona' : 'personas'}</span>
                          </div>
                        </div>

                        {/* Botón de selección */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => toggleCabana(cabana.id_cabana)}
                            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                              isSelected
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            }`}
                          >
                            {isSelected ? '✓ Seleccionada' : 'Seleccionar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Panel de resumen y continuar */}
            {cabanasSeleccionadas.length > 0 && (
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 sticky bottom-24">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Resumen de tu reserva
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4 text-gray-700">
                      <div className="flex items-center gap-2">
                        <Home size={18} className="text-orange-500" />
                        <span>{cabanasSeleccionadas.length} {cabanasSeleccionadas.length === 1 ? 'cabaña' : 'cabañas'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-orange-500" />
                        <span>Capacidad: {capacidadSeleccionada} personas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-orange-500" />
                        <span className="font-bold text-lg">
                          ARS ${precioTotal.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSiguiente}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition duration-300 transform hover:scale-105 whitespace-nowrap"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
