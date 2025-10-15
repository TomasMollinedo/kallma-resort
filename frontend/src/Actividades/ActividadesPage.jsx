import { Link } from 'react-router-dom';

// ----------------------------------------------------------------------
// 1. DATOS DE LAS ACTIVIDADES (Se pueden mover a un archivo separado después)
// ----------------------------------------------------------------------
const modulosActividades = [
  {
    titulo: "Caminata por Lagos Escondidos",
    descripcion: "Recorrido a pie entre bosques de lenga y orillas de lagos glaciares. Senderos suaves para disfrutar del silencio y la belleza patagónica.",
    imagen: "/img/caminata.jpg", // ¡Reemplaza por la ruta real!
    slug: "caminata-lagos-escondidos",
  },
  {
    titulo: "Taller de Artesanía en Madera",
    descripcion: "Aprendé técnicas de tallado y creá tu propio recuerdo en madera nativa, disfrutando del calor de la chimenea.",
    imagen: "/img/taller.jpg", // ¡Reemplaza por la ruta real!
    slug: "taller-artesania-madera",
  },
  {
    titulo: "Cabalgata en Valles Fueguinos",
    descripcion: "Paseo guiado a caballo por senderos de bosques y valles, con vistas a montañas nevadas y lagos cristalinos. Ideal para conectar con la naturaleza a otro ritmo.",
    imagen: "/img/cabalgata.jpg", // ¡Reemplaza por la ruta real!
    slug: "cabalgata-valles-fueguinos",
  },
];

// ----------------------------------------------------------------------
// 2. COMPONENTE AUXILIAR (ActividadCard)
// ----------------------------------------------------------------------
const ActividadCard = ({ titulo, descripcion, imagen, slug }) => (
  <Link 
    to={`/actividades/${slug}`} 
    className="relative overflow-hidden group h-[60vh] md:h-full block"
  >
    <img 
      src={imagen} 
      alt={titulo} 
      className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105" 
    />
    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition duration-300 flex items-end p-8">
      <div className="text-white">
        <h3 className="text-xl font-lexend font-semibold mb-2">{titulo}</h3>
        <p className="text-sm opacity-90 line-clamp-2">{descripcion}</p>
        <span className="mt-4 inline-block text-sm font-medium border-b border-white hover:border-transparent transition duration-200">
          Ver más detalles →
        </span>
      </div>
    </div>
  </Link>
);

// ----------------------------------------------------------------------
// 3. COMPONENTE PRINCIPAL (ActividadesPage)
// ----------------------------------------------------------------------
export default function ActividadesPage() {
  return (
    <div className="relative">
      
      {/* SECCIÓN 1: HERO/BANNER SUPERIOR */}
      <div 
        className="relative h-screen bg-cover bg-center flex items-end p-10 md:p-16 text-white" 
        style={{ 
          backgroundImage: "url('/img/actividades-hero.jpg')", // ¡Reemplaza por la ruta real!
          backgroundPosition: 'center top'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-end">
          
          {/* Título de la Página */}
          <h1 className="text-5xl md:text-7xl font-lexend font-extrabold mb-10 md:mb-0 pt-20">
            Actividades
          </h1>
          
          {/* Tarjeta de 'Noches de Cielo Infinito' */}
          <div className="max-w-xs md:max-w-sm bg-black/50 p-6 rounded-lg backdrop-blur-sm border border-white/20">
            <h2 className="text-xl font-lexend font-semibold mb-2">Noches de Cielo Infinito</h2>
            <p className="text-sm leading-relaxed">
              Observa constelaciones australes y, en invierno, el cielo más puro del sur junto a un fogata y chocolate caliente.
            </p>
          </div>
        </div>
      </div>
      
      {/* SECCIÓN 2: MÓDULOS DE TARJETAS (Caminata, Taller, Cabalgata) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {modulosActividades.map((actividad) => (
          <ActividadCard 
            key={actividad.slug}
            titulo={actividad.titulo}
            descripcion={actividad.descripcion}
            imagen={actividad.imagen}
            slug={actividad.slug}
          />
        ))}
      </div>

      {/* SECCIÓN 3: Contenido adicional */}
      <div className="p-16 bg-gray-50">
          <h2 className="text-3xl font-lexend font-bold text-center text-gray-800">Explorá la Patagonia a tu ritmo</h2>
      </div>

    </div>
  )
}