import { Link } from "react-router-dom"; 
import { Home, Info, MessageCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="absolute top-0 left-0 w-full flex justify-between items-center px-10 py-6 text-white z-50 font-lexend">
      {/* Bloque izquierdo con íconos y texto */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          
          {/* Ícono Home (usando Link) */}
          <Link to="/" className="border border-white/40 p-2 rounded-full hover:bg-white/20 transition">
            <Home size={18} />
          </Link>

          {/* Ícono Info (usando Link) */}
          <Link to="/informacion" className="border border-white/40 p-2 rounded-full hover:bg-white/20 transition">
            <Info size={18} />
          </Link>

          {/* Ícono Chat (usando Button para posible Modal/Widget) */}
          <button className="border border-white/40 p-2 rounded-full hover:bg-white/20 transition">
            <MessageCircle size={18} />
          </button>
        </div>
        <p className="text-sm leading-tight">
          <span className="font-semibold">¿Necesitás ayuda?</span><br />
          Chateá con nosotros
        </p>
      </div>

      {/* Menú principal */}
      <nav className="flex items-center space-x-8 text-sm">
        {/* Usando Link para navegar entre páginas */}
        <Link to="/cabanas" className="hover:text-gray-200">Cabañas</Link>
        <Link to="/servicios" className="hover:text-gray-200">Servicios</Link>
        <Link to="/actividades" className="hover:text-gray-200">Actividades</Link>

        {/* Botón Acceder (usando Button para posible Modal/Acción) */}
        <button className="border border-white rounded-full px-6 py-2 hover:bg-white hover:text-black transition">
          Acceder
        </button>
      </nav>
    </header>
  )
}

