import './Actividades.css';
import { actividadesData } from './actividadesData';

// ----------------------------------------------------------------------
// 1. DATOS DE LAS ACTIVIDADES 
// ----------------------------------------------------------------------
const modulosActividades = actividadesData.slice(1, 4).map((a) => ({
  titulo: a.nombre,
  descripcion: a.descripcion,
  imagen: a.imagen,
}));

// ----------------------------------------------------------------------
// 2. COMPONENTE AUXILIAR (ActividadCard)
// ----------------------------------------------------------------------
const ActividadCard = ({ titulo, descripcion, imagen }) => (
  <div className="relative overflow-hidden group h-[260px] sm:h-[320px] md:h-[360px] lg:h-[380px]">
    <img
      src={imagen}
      alt={titulo}
      className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition duration-300" />
    <div className="relative z-10 h-full w-full flex items-end p-6">
      <div className="text-white text-glow">
        <h3
          className="text-lg sm:text-xl font-semibold mb-2"
          style={{ color: '#ff9f43' }}
        >
          {titulo}
        </h3>
        <p className="text-xs sm:text-sm text-gray-200 max-w-[90%]">
          {descripcion}
        </p>
      </div>
    </div>
  </div>
);

// ----------------------------------------------------------------------
// 3. COMPONENTE PRINCIPAL 
// ----------------------------------------------------------------------
export default function ActividadesPage() {
  const hero = actividadesData[0];
  return (
    <div className="relative pb-10">
      
      {/* SECCIÓN 1: HERO/BANNER SUPERIOR */}
      <div
        className="relative h-[60vh] md:h-[70vh] bg-cover bg-center flex items-end p-10 md:p-16 text-white"
        style={{
          backgroundImage: `url(${hero?.imagen})`,
          backgroundPosition: 'center top',
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end">
          
          {/* Título de la Página */}
          <h1
            className="text-5xl md:text-7xl font-lexend font-extrabold mb-10 md:mb-0 pt-20 text-glow"
            style={{ color: '#ff9f43' }} // 🔸 título principal naranja
          >
            Actividades
          </h1>

          {/* Descripción de la actividad 'Noches de Cielo Infinito' */}
          <div className="max-w-xs md:max-w-sm bg-transparent p-6 rounded-lg border-0"> 
            {/* 🔸 sin borde visible */}
            <h2
              className="text-xl font-lexend font-semibold mb-2"
              style={{ color: '#ff9f43' }} // 🔸 título también naranja
            >
              {hero?.nombre}
            </h2>
            <p className="text-sm leading-relaxed text-gray-200">
              {hero?.descripcion}
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: MÓDULOS DE TARJETAS (Caminata, Taller, Cabalgata) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {modulosActividades.map((actividad, idx) => (
          <ActividadCard
            key={idx}
            titulo={actividad.titulo}
            descripcion={actividad.descripcion}
            imagen={actividad.imagen}
          />
        ))}
      </div>
    </div>
  );
}
